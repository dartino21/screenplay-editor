import type { ElementType, FormatPreset, ScriptElement } from '../model/types'

export type DisplayLine =
  | {
      kind: 'element'
      element: ScriptElement
      page: number
      editable: boolean
      displayText?: string
    }
  | { kind: 'more'; page: number }
  | { kind: 'contd'; name: string; page: number }
  | { kind: 'page_break'; page: number }

const LINES_PER_PAGE = 55

function wrappedLines(text: string, charsPerLine: number): number {
  if (!text) return 1
  const parts = text.split('\n')
  let total = 0
  for (const part of parts) {
    total += Math.max(1, Math.ceil(Math.max(part.length, 1) / charsPerLine))
  }
  return total
}

function charsForType(type: ElementType, format: FormatPreset): number {
  if (format === 'us') {
    switch (type) {
      case 'dialogue':
        return 35
      case 'parenthetical':
        return 25
      case 'character':
        return 30
      case 'transition':
        return 20
      default:
        return 60
    }
  }
  // A4 RU: dialogue column ≈ 72.5 mm ≈ 2.85″ ≈ 28–29 Courier chars
  switch (type) {
    case 'dialogue':
      return 29
    case 'parenthetical':
      return 19
    case 'character':
      return 32
    case 'transition':
      return 20
    default:
      return 58
  }
}

function isDialogueBlock(type: ElementType): boolean {
  return type === 'character' || type === 'parenthetical' || type === 'dialogue'
}

function findSpeaker(elements: ScriptElement[], from: number): string {
  for (let j = from; j >= 0; j--) {
    if (elements[j].type === 'character') {
      return elements[j].text.replace(/\s*\(CONT['']D\)\s*$/i, '').trim()
    }
  }
  return 'CHARACTER'
}

/**
 * Paginate without cloning editable dialogue across pages (avoids duplicate ids).
 * If a block doesn't fit, move it to the next page. For mid-dialogue page
 * transitions (character+dialogue would straddle), insert MORE/CONT'D and move
 * the dialogue block intact.
 */
export function paginate(
  elements: ScriptElement[],
  format: FormatPreset,
): DisplayLine[] {
  const result: DisplayLine[] = []
  let page = 1
  let used = 0

  const pushBreak = () => {
    result.push({ kind: 'page_break', page })
    page++
    used = 0
  }

  for (let i = 0; i < elements.length; i++) {
    const el = elements[i]
    const lines = wrappedLines(el.text, charsForType(el.type, format))
    const gap = i > 0 ? 1 : 0
    const need = gap + lines

    // Character cue needs room for at least one dialogue line
    if (el.type === 'character' && used + need + 2 > LINES_PER_PAGE && used > 0) {
      pushBreak()
    } else if (used + need > LINES_PER_PAGE && used > 0) {
      if (el.type === 'dialogue' || el.type === 'parenthetical') {
        const name = findSpeaker(elements, i - 1)
        result.push({ kind: 'more', page })
        pushBreak()
        result.push({ kind: 'contd', name, page })
        used += 2
      } else {
        pushBreak()
      }
    }

    result.push({ kind: 'element', element: el, page, editable: true })
    used += need

    // Orphan character at page bottom
    if (
      el.type === 'character' &&
      used >= LINES_PER_PAGE - 1 &&
      i + 1 < elements.length &&
      isDialogueBlock(elements[i + 1].type)
    ) {
      result.pop()
      pushBreak()
      result.push({ kind: 'element', element: el, page, editable: true })
      used = need
    }
  }

  return result
}

export function pageCount(display: DisplayLine[]): number {
  let max = 1
  for (const line of display) {
    if (line.page > max) max = line.page
  }
  return max
}

export function sceneCount(elements: ScriptElement[]): number {
  return elements.filter((e) => e.type === 'scene_heading').length
}

export function wordCount(elements: ScriptElement[]): number {
  return elements.reduce((n, el) => {
    const parts = el.text.trim().split(/\s+/).filter(Boolean)
    return n + parts.length
  }, 0)
}
