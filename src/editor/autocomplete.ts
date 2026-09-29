import type { FormatPreset, ScriptElement } from '../model/types'

const SCENE_PREFIXES_US = ['INT.', 'EXT.', 'EST.', 'I/E.', 'INT./EXT.']
const SCENE_PREFIXES_RU = ['ИНТ.', 'ЭКСТ.', 'ИНТ./ЭКСТ.']

const TIMES_US = [
  'DAY',
  'NIGHT',
  'DAWN',
  'DUSK',
  'CONTINUOUS',
  'LATER',
  'MORNING',
  'EVENING',
]
const TIMES_RU = [
  'ДЕНЬ',
  'НОЧЬ',
  'УТРО',
  'ВЕЧЕР',
  'РАССВЕТ',
  'ЗАКАТ',
  'ПОЗЖЕ',
  'CONTINUOUS',
]

const CHAR_EXTS = ['(V.O.)', '(O.S.)', "(CONT'D)", '(O.C.)']

export function collectCharacters(elements: ScriptElement[]): string[] {
  const set = new Set<string>()
  for (const el of elements) {
    if (el.type === 'character') {
      const name = el.text
        .replace(/\s*\([^)]*\)\s*$/, '')
        .trim()
        .toUpperCase()
      if (name) set.add(name)
    }
  }
  return [...set].sort()
}

export function collectLocations(elements: ScriptElement[]): string[] {
  const prefixes = [...SCENE_PREFIXES_US, ...SCENE_PREFIXES_RU]
  const set = new Set<string>()
  for (const el of elements) {
    if (el.type === 'scene_heading') {
      let t = el.text.trim()
      for (const p of prefixes) {
        if (t.toUpperCase().startsWith(p.toUpperCase())) {
          t = t.slice(p.length).trim()
          break
        }
      }
      const dash = t.search(/\s[—–-]\s/)
      if (dash >= 0) t = t.slice(0, dash).trim()
      if (t) set.add(t.toUpperCase())
    }
  }
  return [...set].sort()
}

export interface Suggestion {
  label: string
  insert: string
  cursor?: number
}

export function sluglineTemplate(
  kind: 'int' | 'ext',
  format: FormatPreset = 'us',
): { text: string; cursor: number } {
  if (format === 'ru') {
    return kind === 'int'
      ? { text: 'ИНТ.  — ДЕНЬ', cursor: 5 }
      : { text: 'ЭКСТ.  — ДЕНЬ', cursor: 6 }
  }
  return kind === 'int'
    ? { text: 'INT.  — DAY', cursor: 5 }
    : { text: 'EXT.  — DAY', cursor: 5 }
}

export function getSuggestions(
  type: ScriptElement['type'],
  text: string,
  elements: ScriptElement[],
  format: FormatPreset = 'us',
): Suggestion[] {
  const upper = text.toUpperCase()
  const suggestions: Suggestion[] = []
  const times = format === 'ru' ? TIMES_RU : TIMES_US
  const defaultTime = format === 'ru' ? 'ДЕНЬ' : 'DAY'
  const prefixes = format === 'ru' ? SCENE_PREFIXES_RU : SCENE_PREFIXES_US

  if (type === 'character') {
    const base = text.replace(/\s*\([^)]*\)\s*$/, '').trim().toUpperCase()
    for (const name of collectCharacters(elements)) {
      if (name.startsWith(base) && name !== base) {
        suggestions.push({ label: name, insert: name })
      }
    }
    // Extensions only after space or "(" (quiet AC)
    if (base && (text.includes('(') || /\s$/.test(text))) {
      for (const ext of CHAR_EXTS) {
        if (!upper.includes(ext.toUpperCase())) {
          suggestions.push({
            label: ext,
            insert: `${base} ${ext}`.trim(),
          })
        }
      }
    }
  }

  if (type === 'scene_heading') {
    if (!text.trim()) {
      for (const p of prefixes) {
        suggestions.push({
          label: `${p}  — ${defaultTime}`,
          insert: `${p}  — ${defaultTime}`,
          cursor: p.length + 1,
        })
      }
      // also offer the other locale lightly
      const other = format === 'ru' ? SCENE_PREFIXES_US : SCENE_PREFIXES_RU
      const otherTime = format === 'ru' ? 'DAY' : 'ДЕНЬ'
      suggestions.push({
        label: `${other[0]}  — ${otherTime}`,
        insert: `${other[0]}  — ${otherTime}`,
        cursor: other[0].length + 1,
      })
    } else {
      for (const p of [...prefixes, ...SCENE_PREFIXES_US, ...SCENE_PREFIXES_RU]) {
        if (p.toUpperCase().startsWith(upper) && p.toUpperCase() !== upper) {
          suggestions.push({
            label: `${p}  — ${defaultTime}`,
            insert: `${p}  — ${defaultTime}`,
            cursor: p.length + 1,
          })
        }
      }
      for (const loc of collectLocations(elements)) {
        const afterPrefix = text.replace(
          /^(INT\.|EXT\.|EST\.|I\/E\.|INT\.\/EXT\.|ИНТ\.|ЭКСТ\.|ИНТ\.\/ЭКСТ\.)\s*/i,
          '',
        )
        const locPart =
          afterPrefix.split(/\s[—–-]\s/)[0]?.trim().toUpperCase() ?? ''
        if (loc.startsWith(locPart) && loc !== locPart) {
          const prefixMatch = text.match(
            /^(INT\.|EXT\.|EST\.|I\/E\.|INT\.\/EXT\.|ИНТ\.|ЭКСТ\.|ИНТ\.\/ЭКСТ\.)\s*/i,
          )?.[0]
          const prefix =
            prefixMatch ?? (format === 'ru' ? 'ИНТ. ' : 'INT. ')
          suggestions.push({
            label: `${prefix}${loc} — ${defaultTime}`,
            insert: `${prefix}${loc} — ${defaultTime}`,
          })
        }
      }
      for (const time of times) {
        if (text.includes('—') || text.includes('-') || text.includes('–')) {
          const m = text.match(/^(.*[—–-]\s*)(.*)$/)
          if (m && time.startsWith(m[2].toUpperCase())) {
            suggestions.push({ label: time, insert: `${m[1]}${time}` })
          }
        }
      }
    }
  }

  if (type === 'transition' && !text.trim()) {
    suggestions.push(
      { label: 'CUT TO:', insert: 'CUT TO:' },
      { label: 'FADE OUT.', insert: 'FADE OUT.' },
      { label: 'DISSOLVE TO:', insert: 'DISSOLVE TO:' },
      { label: 'SMASH CUT TO:', insert: 'SMASH CUT TO:' },
    )
  }

  if (type === 'parenthetical' && !text.trim()) {
    suggestions.push(
      { label: '(тихо)', insert: '(тихо)' },
      { label: '(громко)', insert: '(громко)' },
      { label: '(пауза)', insert: '(пауза)' },
      { label: '(beat)', insert: '(beat)' },
      { label: '(to himself)', insert: '(to himself)' },
    )
  }

  // dedupe by insert
  const seen = new Set<string>()
  return suggestions
    .filter((s) => {
      if (seen.has(s.insert)) return false
      seen.add(s.insert)
      return true
    })
    .slice(0, 8)
}
