import type { ElementType } from '../model/types'
import { detectTypeFromText } from '../model/fountain'
import { tabNextType } from './smart'

export function nextType(current: ElementType, reverse = false): ElementType {
  return tabNextType(current, reverse)
}

/** Empty parenthetical seeded as `()` still cycles with Tab. */
export function isEmptyLineForTab(type: ElementType, text: string): boolean {
  const t = text.trim()
  if (t === '') return true
  if (type === 'parenthetical' && t === '()') return true
  return false
}

/**
 * All-caps short cue (АННА, JOHN (V.O.)). Switching to a parenthetical
 * must not wrap these in another pair of parentheses.
 */
export function looksLikeCharacterCue(text: string): boolean {
  const t = text.trim()
  if (!t || t.length > 40) return false
  if (t !== t.toUpperCase()) return false
  const words = t.split(/\s+/).filter(Boolean)
  if (words.length > 4) return false
  const letters = t.replace(/[^A-Za-zА-Яа-яЁё]/g, '')
  return letters.length >= 2
}

export function typeAfterEnter(current: ElementType, text: string): ElementType {
  switch (current) {
    case 'character':
      return 'dialogue'
    case 'parenthetical':
      return 'dialogue'
    case 'dialogue':
      return text.trim() === '' ? 'character' : 'action'
    case 'scene_heading':
      return 'action'
    case 'transition':
      return 'scene_heading'
    case 'action':
      return 'action'
    default:
      return 'action'
  }
}

/** ⌘/Ctrl+Enter: jump to next speaking turn */
export function typeAfterCmdEnter(current: ElementType): ElementType {
  if (current === 'dialogue' || current === 'parenthetical' || current === 'action') {
    return 'character'
  }
  if (current === 'character') return 'dialogue'
  return typeAfterEnter(current, '')
}

export function applyAutoCaps(type: ElementType, text: string): string {
  if (type === 'scene_heading' || type === 'character' || type === 'transition') {
    return text.toUpperCase()
  }
  return text
}

export function looksLikeCharacterName(text: string): boolean {
  const t = text.trim()
  if (!t || t.length > 40) return false
  if (/^(INT\.|EXT\.|EST\.|I\/E|ИНТ\.|ЭКСТ\.)/i.test(t)) return false
  if (detectTypeFromText(t) === 'scene_heading') return false
  // Single token or short name — allow lowercase (RU writers); will be capped
  if (/\s{2,}/.test(t)) return false
  const words = t.split(/\s+/).filter(Boolean)
  if (words.length > 4) return false
  // Reject if looks like a full sentence
  if (/[.!?]$/.test(t) || t.length > 32) return false
  const letters = t.replace(/[^a-zA-Zа-яА-ЯёЁ]/g, '')
  return letters.length >= 2
}

export const TYPE_LABELS: Record<ElementType, string> = {
  scene_heading: 'Сцена',
  action: 'Действие',
  character: 'Персонаж',
  dialogue: 'Диалог',
  parenthetical: 'Ремарка',
  transition: 'Переход',
}
