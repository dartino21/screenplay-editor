import { parseFountain, serializeFountain } from './model/fountain'
import {
  emptyDocument,
  type FormatPreset,
  type ScriptDocument,
  type TitlePage,
} from './model/types'

const LEGACY_DOC_KEY = 'screenplay:document'
const LEGACY_FORMAT_KEY = 'screenplay:format'
const LIBRARY_KEY = 'screenplay:library'

export interface ScriptMeta {
  id: string
  title: string
  updatedAt: number
  createdAt: number
}

interface StoredEntry {
  id: string
  title: string
  updatedAt: number
  createdAt: number
  fountain: string
  format: FormatPreset
  titlePage: TitlePage
}

interface LibraryState {
  currentId: string
  scripts: Record<string, StoredEntry>
}

function now() {
  return Date.now()
}

function titleFromDoc(doc: ScriptDocument): string {
  const t = doc.titlePage.title?.trim()
  return t || 'Без названия'
}

function entryFromDoc(id: string, doc: ScriptDocument, createdAt?: number): StoredEntry {
  const ts = now()
  return {
    id,
    title: titleFromDoc(doc),
    createdAt: createdAt ?? ts,
    updatedAt: ts,
    fountain: serializeFountain(doc),
    format: doc.format,
    titlePage: { ...doc.titlePage },
  }
}

function docFromEntry(entry: StoredEntry): ScriptDocument {
  const doc = parseFountain(entry.fountain)
  doc.format = entry.format
  doc.titlePage = { ...entry.titlePage }
  if (!doc.titlePage.title) doc.titlePage.title = entry.title
  return doc
}

function readLibrary(): LibraryState | null {
  try {
    const raw = localStorage.getItem(LIBRARY_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as LibraryState
    if (!parsed?.scripts || typeof parsed.scripts !== 'object') return null
    if (!parsed.currentId || !parsed.scripts[parsed.currentId]) {
      const ids = Object.keys(parsed.scripts)
      if (!ids.length) return null
      parsed.currentId = ids.sort(
        (a, b) => parsed.scripts[b].updatedAt - parsed.scripts[a].updatedAt,
      )[0]
    }
    return parsed
  } catch {
    return null
  }
}

function writeLibrary(state: LibraryState): void {
  localStorage.setItem(LIBRARY_KEY, JSON.stringify(state))
}

function migrateLegacy(): LibraryState | null {
  try {
    const raw = localStorage.getItem(LEGACY_DOC_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as {
      fountain?: string
      format?: FormatPreset
      titlePage?: TitlePage
    }
    if (!parsed.fountain) return null
    const doc = parseFountain(parsed.fountain)
    if (parsed.format) doc.format = parsed.format
    if (parsed.titlePage) {
      doc.titlePage = { ...doc.titlePage, ...parsed.titlePage }
    }
    const id = crypto.randomUUID()
    const entry = entryFromDoc(id, doc)
    const state: LibraryState = { currentId: id, scripts: { [id]: entry } }
    writeLibrary(state)
    localStorage.removeItem(LEGACY_DOC_KEY)
    localStorage.removeItem(LEGACY_FORMAT_KEY)
    return state
  } catch {
    return null
  }
}

function ensureLibrary(): LibraryState {
  const existing = readLibrary()
  if (existing) return existing
  const migrated = migrateLegacy()
  if (migrated) return migrated
  const id = crypto.randomUUID()
  const doc = emptyDocument()
  const entry = entryFromDoc(id, doc)
  const state: LibraryState = { currentId: id, scripts: { [id]: entry } }
  writeLibrary(state)
  return state
}

/** Load library (with migration). Seeds `sample` only on a brand-new empty install. */
export function loadOrSeedDocument(sample: ScriptDocument): ScriptDocument {
  const hadLibrary = !!localStorage.getItem(LIBRARY_KEY)
  const hadLegacy = !!localStorage.getItem(LEGACY_DOC_KEY)
  if (!hadLibrary && !hadLegacy) {
    const id = crypto.randomUUID()
    const entry = entryFromDoc(id, sample)
    writeLibrary({ currentId: id, scripts: { [id]: entry } })
    return docFromEntry(entry)
  }
  return loadDocument()
}

export function listScripts(): ScriptMeta[] {
  const lib = ensureLibrary()
  return Object.values(lib.scripts)
    .map(({ id, title, updatedAt, createdAt }) => ({
      id,
      title,
      updatedAt,
      createdAt,
    }))
    .sort((a, b) => b.updatedAt - a.updatedAt)
}

export function getCurrentScriptId(): string {
  return ensureLibrary().currentId
}

export function loadDocument(): ScriptDocument {
  const lib = ensureLibrary()
  return docFromEntry(lib.scripts[lib.currentId])
}

/** Autosave / update the currently open script. */
export function saveDocument(doc: ScriptDocument): void {
  const lib = ensureLibrary()
  const prev = lib.scripts[lib.currentId]
  const entry = entryFromDoc(lib.currentId, doc, prev?.createdAt)
  lib.scripts[lib.currentId] = entry
  writeLibrary(lib)
}

/** Create a new empty script and make it current. Returns its id. */
export function createScript(doc: ScriptDocument = emptyDocument()): string {
  const lib = ensureLibrary()
  const id = crypto.randomUUID()
  lib.scripts[id] = entryFromDoc(id, doc)
  lib.currentId = id
  writeLibrary(lib)
  return id
}

/** Save a copy under a new name and switch to it. */
export function saveScriptAs(doc: ScriptDocument, title: string): string {
  const copy: ScriptDocument = {
    format: doc.format,
    titlePage: { ...doc.titlePage, title: title.trim() || 'Без названия' },
    elements: doc.elements.map((el) => ({ ...el })),
  }
  return createScript(copy)
}

export function openScript(id: string): ScriptDocument | null {
  const lib = ensureLibrary()
  const entry = lib.scripts[id]
  if (!entry) return null
  lib.currentId = id
  writeLibrary(lib)
  return docFromEntry(entry)
}

export function deleteScript(id: string): ScriptDocument | null {
  const lib = ensureLibrary()
  if (!lib.scripts[id]) return null
  const ids = Object.keys(lib.scripts)
  if (ids.length <= 1) {
    // Keep at least one: replace with empty
    const fresh = emptyDocument()
    lib.scripts[id] = entryFromDoc(id, fresh, lib.scripts[id].createdAt)
    lib.currentId = id
    writeLibrary(lib)
    return fresh
  }
  delete lib.scripts[id]
  if (lib.currentId === id) {
    const next = Object.values(lib.scripts).sort(
      (a, b) => b.updatedAt - a.updatedAt,
    )[0]
    lib.currentId = next.id
  }
  writeLibrary(lib)
  return docFromEntry(lib.scripts[lib.currentId])
}

export function duplicateScript(id: string): string | null {
  const lib = ensureLibrary()
  const src = lib.scripts[id]
  if (!src) return null
  const doc = docFromEntry(src)
  doc.titlePage = {
    ...doc.titlePage,
    title: `${titleFromDoc(doc)} (копия)`,
  }
  return createScript(doc)
}

export function renameScript(id: string, title: string): void {
  const lib = ensureLibrary()
  const entry = lib.scripts[id]
  if (!entry) return
  const t = title.trim() || 'Без названия'
  entry.title = t
  entry.titlePage = { ...entry.titlePage, title: t }
  entry.updatedAt = now()
  // Keep fountain title in sync when possible
  const doc = docFromEntry(entry)
  doc.titlePage.title = t
  lib.scripts[id] = entryFromDoc(id, doc, entry.createdAt)
  writeLibrary(lib)
}

/** @deprecated — library always keeps entries; use createScript / deleteScript */
export function clearDocument(): void {
  const lib = ensureLibrary()
  const id = lib.currentId
  const fresh = emptyDocument()
  lib.scripts[id] = entryFromDoc(id, fresh, lib.scripts[id]?.createdAt)
  writeLibrary(lib)
}
