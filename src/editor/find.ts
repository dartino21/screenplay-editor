import { baseCharacterName } from './smart'
import type { ScriptDocument, ScriptElement } from '../model/types'

export type FindMatch = {
  elementId: string
  elementIndex: number
  start: number
  end: number
}

export function findInDocument(
  doc: ScriptDocument,
  query: string,
  caseSensitive = false,
): FindMatch[] {
  if (!query) return []
  const matches: FindMatch[] = []
  const q = caseSensitive ? query : query.toLowerCase()

  doc.elements.forEach((el, elementIndex) => {
    const source = caseSensitive ? el.text : el.text.toLowerCase()
    let from = 0
    while (from <= source.length) {
      const at = source.indexOf(q, from)
      if (at < 0) break
      matches.push({
        elementId: el.id,
        elementIndex,
        start: at,
        end: at + query.length,
      })
      from = at + Math.max(1, query.length)
    }
  })
  return matches
}

/** Rename character cue base name everywhere; keep (V.O.) / (CONT'D) etc. */
export function renameCharacterInElements(
  elements: ScriptElement[],
  fromName: string,
  toName: string,
): ScriptElement[] {
  const from = baseCharacterName(fromName)
  const to = toName.trim().toUpperCase()
  if (!from || !to || from === to) return elements

  return elements.map((el) => {
    if (el.type !== 'character') return el
    const base = baseCharacterName(el.text)
    if (base !== from) return el
    const ext = el.text.match(/\s*\([^)]*\)\s*$/)?.[0] ?? ''
    return { ...el, text: `${to}${ext}`.trim() }
  })
}

export function replaceInElements(
  elements: ScriptElement[],
  query: string,
  replacement: string,
  caseSensitive = false,
): { elements: ScriptElement[]; count: number } {
  if (!query) return { elements, count: 0 }
  let count = 0
  const next = elements.map((el) => {
    if (caseSensitive) {
      if (!el.text.includes(query)) return el
      const parts = el.text.split(query)
      count += parts.length - 1
      return { ...el, text: parts.join(replacement) }
    }
    const re = new RegExp(
      query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'),
      'gi',
    )
    const found = el.text.match(re)
    if (!found) return el
    count += found.length
    return { ...el, text: el.text.replace(re, replacement) }
  })
  return { elements: next, count }
}
