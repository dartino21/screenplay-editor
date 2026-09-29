import type { ElementType, ScriptElement } from '../model/types'

/** Strip (V.O.) / (CONT'D) etc. */
export function baseCharacterName(text: string): string {
  return text.replace(/\s*\([^)]*\)\s*$/, '').trim().toUpperCase()
}

/** Last character cue before index (ignoring page CONT'D display). */
export function previousSpeaker(
  elements: ScriptElement[],
  beforeIndex: number,
): string | null {
  for (let i = beforeIndex - 1; i >= 0; i--) {
    if (elements[i].type === 'character') {
      return baseCharacterName(elements[i].text)
    }
    if (elements[i].type === 'scene_heading') return null
  }
  return null
}

/**
 * Final Draft-style Automatic Character Continueds:
 * same speaker after intervening action (not another character) → (CONT'D).
 */
export function applyAutoContd(
  name: string,
  elements: ScriptElement[],
  insertAt: number,
): string {
  const base = baseCharacterName(name)
  if (!base) return name.toUpperCase()

  let lastSpeaker: string | null = null
  let sawInterruption = false

  for (let i = insertAt - 1; i >= 0; i--) {
    const el = elements[i]
    if (el.type === 'scene_heading') break
    if (el.type === 'character') {
      lastSpeaker = baseCharacterName(el.text)
      break
    }
    if (el.type === 'action' || el.type === 'transition') {
      sawInterruption = true
    }
  }

  const already = /\(CONT['']D\)/i.test(name)
  if (lastSpeaker === base && sawInterruption && !already) {
    // Keep existing extensions like (V.O.) then add CONT'D if not present
    const cleaned = name.replace(/\s*\(CONT['']D\)\s*/gi, '').trim()
    if (/\([^)]+\)\s*$/.test(cleaned)) {
      return `${cleaned} (CONT'D)`.toUpperCase()
    }
    return `${base} (CONT'D)`
  }

  return name.toUpperCase()
}

/** Industry-ish contextual Tab (Fade In / Final Draft style). */
export function tabNextType(current: ElementType, reverse = false): ElementType {
  const forward: Record<ElementType, ElementType> = {
    action: 'character',
    character: 'dialogue',
    dialogue: 'parenthetical',
    parenthetical: 'action',
    scene_heading: 'action',
    transition: 'scene_heading',
  }
  const backward: Record<ElementType, ElementType> = {
    character: 'action',
    dialogue: 'character',
    parenthetical: 'dialogue',
    action: 'scene_heading',
    scene_heading: 'transition',
    transition: 'action',
  }
  return reverse ? backward[current] : forward[current]
}

export function recentSpeakers(
  elements: ScriptElement[],
  limit = 6,
): string[] {
  const seen: string[] = []
  for (let i = elements.length - 1; i >= 0; i--) {
    if (elements[i].type !== 'character') continue
    const n = baseCharacterName(elements[i].text)
    if (n && !seen.includes(n)) seen.push(n)
    if (seen.length >= limit) break
  }
  return seen
}

export function collectScenes(
  elements: ScriptElement[],
): { id: string; index: number; text: string; number: number }[] {
  const scenes: { id: string; index: number; text: string; number: number }[] =
    []
  let n = 0
  elements.forEach((el, index) => {
    if (el.type === 'scene_heading') {
      n++
      scenes.push({ id: el.id, index, text: el.text || 'БЕЗ ЗАГОЛОВКА', number: n })
    }
  })
  return scenes
}

/** Find scene heading id that owns the element at focusIndex. */
export function activeSceneId(
  elements: ScriptElement[],
  focusIndex: number,
): string | null {
  for (let i = Math.min(focusIndex, elements.length - 1); i >= 0; i--) {
    if (elements[i].type === 'scene_heading') return elements[i].id
  }
  return null
}
