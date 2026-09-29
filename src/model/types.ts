export type ElementType =
  | 'scene_heading'
  | 'action'
  | 'character'
  | 'dialogue'
  | 'parenthetical'
  | 'transition'

export type FormatPreset = 'us' | 'ru'

export interface ScriptElement {
  id: string
  type: ElementType
  text: string
}

export interface TitlePage {
  title: string
  author: string
  draftDate: string
  contact: string
}

export interface ScriptDocument {
  titlePage: TitlePage
  elements: ScriptElement[]
  format: FormatPreset
}

export const ELEMENT_CYCLE: ElementType[] = [
  'action',
  'character',
  'dialogue',
  'parenthetical',
  'transition',
  'scene_heading',
]

export function createId(): string {
  return crypto.randomUUID()
}

export function createElement(
  type: ElementType = 'action',
  text = '',
): ScriptElement {
  return { id: createId(), type, text }
}

export function emptyDocument(): ScriptDocument {
  return {
    titlePage: {
      title: 'Без названия',
      author: '',
      draftDate: '',
      contact: '',
    },
    elements: [
      createElement('scene_heading', 'INT.  — DAY'),
      createElement('action', ''),
    ],
    format: 'us',
  }
}
