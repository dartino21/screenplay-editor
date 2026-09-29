import { parseFountain, serializeFountain } from './model/fountain'
import { emptyDocument, type FormatPreset, type ScriptDocument } from './model/types'

const DOC_KEY = 'screenplay:document'
const FORMAT_KEY = 'screenplay:format'

export function loadDocument(): ScriptDocument {
  try {
    const raw = localStorage.getItem(DOC_KEY)
    if (!raw) return emptyDocument()
    const parsed = JSON.parse(raw) as {
      fountain?: string
      format?: FormatPreset
      titlePage?: ScriptDocument['titlePage']
    }
    if (parsed.fountain) {
      const doc = parseFountain(parsed.fountain)
      if (parsed.format) doc.format = parsed.format
      if (parsed.titlePage) {
        doc.titlePage = { ...doc.titlePage, ...parsed.titlePage }
      }
      return doc
    }
  } catch {
    // fall through
  }
  return emptyDocument()
}

export function saveDocument(doc: ScriptDocument): void {
  const payload = {
    fountain: serializeFountain(doc),
    format: doc.format,
    titlePage: doc.titlePage,
  }
  localStorage.setItem(DOC_KEY, JSON.stringify(payload))
  localStorage.setItem(FORMAT_KEY, doc.format)
}

export function clearDocument(): void {
  localStorage.removeItem(DOC_KEY)
  localStorage.removeItem(FORMAT_KEY)
}
