import {
  createElement,
  createId,
  emptyDocument,
  type ElementType,
  type ScriptDocument,
  type ScriptElement,
  type TitlePage,
} from './types'

const SCENE_START =
  /^(INT\.|EXT\.|EST\.|I\/E\.|INT\.\/EXT\.|INT\/EXT\.|INT\/EXT|ИНТ\.|ЭКСТ\.|ИНТ\.\/ЭКСТ\.|ИНТ\/ЭКСТ)/i

const TRANSITION_END = / TO:$/

function isAllCaps(text: string): boolean {
  const letters = text.replace(/[^a-zA-Zа-яА-ЯёЁ]/g, '')
  if (!letters) return false
  return letters === letters.toUpperCase()
}

function stripCharacterExt(text: string): string {
  return text.replace(/\s*\([^)]*\)\s*$/, '').trim()
}

export function serializeFountain(doc: ScriptDocument): string {
  const lines: string[] = []
  const { titlePage } = doc

  if (titlePage.title) lines.push(`Title: ${titlePage.title}`)
  if (titlePage.author) lines.push(`Author: ${titlePage.author}`)
  if (titlePage.draftDate) lines.push(`Draft date: ${titlePage.draftDate}`)
  if (titlePage.contact) lines.push(`Contact: ${titlePage.contact}`)

  if (lines.length) lines.push('')

  for (let i = 0; i < doc.elements.length; i++) {
    const el = doc.elements[i]
    const prev = doc.elements[i - 1]
    const text = el.text

    switch (el.type) {
      case 'scene_heading': {
        if (prev) lines.push('')
        const forced =
          text && !SCENE_START.test(text) && !text.startsWith('.')
            ? `.${text}`
            : text
        lines.push(forced || '.')
        break
      }
      case 'action': {
        if (prev && prev.type !== 'action') lines.push('')
        lines.push(text || ' ')
        break
      }
      case 'character': {
        lines.push('')
        lines.push(text.toUpperCase() || 'CHARACTER')
        break
      }
      case 'parenthetical': {
        const body = text.trim()
        if (body.startsWith('(') && body.endsWith(')')) lines.push(body)
        else lines.push(`(${body})`)
        break
      }
      case 'dialogue': {
        lines.push(text)
        break
      }
      case 'transition': {
        lines.push('')
        const t = text.trim()
        if (t.endsWith('TO:') || t.startsWith('>')) lines.push(t.toUpperCase())
        else lines.push(`>${t}`)
        break
      }
    }
  }

  return lines.join('\n').replace(/\n+$/, '\n')
}

export function parseFountain(source: string): ScriptDocument {
  const doc = emptyDocument()
  doc.elements = []

  const rawLines = source.replace(/\r\n/g, '\n').split('\n')
  let i = 0
  const titlePage: TitlePage = {
    title: '',
    author: '',
    draftDate: '',
    contact: '',
  }

  // Title page: key: value until blank line
  while (i < rawLines.length) {
    const line = rawLines[i]
    if (line.trim() === '') {
      i++
      break
    }
    const m = line.match(/^([^:]+):\s*(.*)$/)
    if (!m || isAllCaps(m[1].trim())) break
    const key = m[1].trim().toLowerCase()
    const value = m[2].trim()
    if (key === 'title') titlePage.title = value
    else if (key === 'author' || key === 'writers' || key === 'writer')
      titlePage.author = value
    else if (key === 'draft date' || key === 'date') titlePage.draftDate = value
    else if (key === 'contact') titlePage.contact = value
    i++
  }

  doc.titlePage = titlePage

  let pendingBlank = false

  while (i < rawLines.length) {
    const line = rawLines[i]
    const trimmed = line.trim()

    if (trimmed === '') {
      pendingBlank = true
      i++
      continue
    }

    // Boneyard skip /* */
    if (trimmed.startsWith('/*')) {
      while (i < rawLines.length && !rawLines[i].includes('*/')) i++
      i++
      continue
    }

    // Notes [[...]]
    if (trimmed.startsWith('[[') && trimmed.endsWith(']]')) {
      i++
      continue
    }

    // Sections / synopsis — treat as action for MVP
    if (trimmed.startsWith('#') || trimmed.startsWith('=')) {
      doc.elements.push(createElement('action', trimmed))
      pendingBlank = false
      i++
      continue
    }

    // Forced scene heading
    if (trimmed.startsWith('.') && !trimmed.startsWith('..')) {
      doc.elements.push(createElement('scene_heading', trimmed.slice(1)))
      pendingBlank = false
      i++
      continue
    }

    // Scene heading
    if (SCENE_START.test(trimmed) && (pendingBlank || doc.elements.length === 0)) {
      doc.elements.push(createElement('scene_heading', trimmed.toUpperCase()))
      pendingBlank = false
      i++
      continue
    }

    // Forced transition
    if (trimmed.startsWith('>')) {
      doc.elements.push(
        createElement('transition', trimmed.slice(1).trim().toUpperCase()),
      )
      pendingBlank = false
      i++
      continue
    }

    // Transition ending TO:
    if (
      isAllCaps(trimmed) &&
      TRANSITION_END.test(trimmed) &&
      pendingBlank
    ) {
      doc.elements.push(createElement('transition', trimmed))
      pendingBlank = false
      i++
      continue
    }

    // Character: all caps, blank before, next line not blank
    const next = rawLines[i + 1]
    const nextTrim = next?.trim() ?? ''
    if (
      pendingBlank &&
      isAllCaps(stripCharacterExt(trimmed)) &&
      !TRANSITION_END.test(trimmed) &&
      next !== undefined &&
      nextTrim !== ''
    ) {
      doc.elements.push(createElement('character', trimmed.toUpperCase()))
      pendingBlank = false
      i++
      continue
    }

    const last = doc.elements[doc.elements.length - 1]

    // Parenthetical after character or dialogue
    if (
      trimmed.startsWith('(') &&
      trimmed.endsWith(')') &&
      last &&
      (last.type === 'character' || last.type === 'dialogue')
    ) {
      doc.elements.push(createElement('parenthetical', trimmed))
      pendingBlank = false
      i++
      continue
    }

    // Dialogue after character or parenthetical
    if (
      last &&
      (last.type === 'character' ||
        last.type === 'parenthetical' ||
        last.type === 'dialogue') &&
      !pendingBlank
    ) {
      doc.elements.push(createElement('dialogue', line))
      pendingBlank = false
      i++
      continue
    }

    // Default: action
    doc.elements.push(createElement('action', line))
    pendingBlank = false
    i++
  }

  if (doc.elements.length === 0) {
    doc.elements = emptyDocument().elements
  }

  return doc
}

export function detectTypeFromText(
  text: string,
  prevType?: ElementType,
): ElementType | null {
  const t = text.trim()
  if (!t) return null

  if (SCENE_START.test(t) || t.startsWith('.')) return 'scene_heading'

  if (
    (t.startsWith('(') || t.endsWith(')')) &&
    (prevType === 'character' || prevType === 'dialogue')
  ) {
    return 'parenthetical'
  }

  if (TRANSITION_END.test(t.toUpperCase()) || t.startsWith('>')) {
    return 'transition'
  }

  return null
}

export function shouldAutoCaps(type: ElementType): boolean {
  return type === 'scene_heading' || type === 'character' || type === 'transition'
}

export function cloneElements(elements: ScriptElement[]): ScriptElement[] {
  return elements.map((el) => ({ ...el, id: createId() }))
}
