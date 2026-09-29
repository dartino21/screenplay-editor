import type { ScriptDocument } from '../model/types'

const MAX = 80

/**
 * Full-document snapshots (not Fountain round-trip).
 * Fountain serialize/parse drops empty action lines and remaps ids,
 * which broke Undo/Redo fidelity (QA: redo lost blank actions after INT insert).
 */
export class HistoryStack {
  private past: string[] = []
  private future: string[] = []
  private lastSnapshot = ''

  constructor(doc: ScriptDocument) {
    this.lastSnapshot = this.snap(doc)
  }

  private snap(doc: ScriptDocument): string {
    return JSON.stringify({
      format: doc.format,
      titlePage: doc.titlePage,
      elements: doc.elements,
    })
  }

  private restore(raw: string): ScriptDocument {
    const parsed = JSON.parse(raw) as ScriptDocument
    return {
      format: parsed.format,
      titlePage: { ...parsed.titlePage },
      elements: parsed.elements.map((el) => ({ ...el })),
    }
  }

  push(doc: ScriptDocument) {
    const s = this.snap(doc)
    // A new edit always drops redo. The snapshot may still match when typing
    // starts (the characters land after this push).
    this.future = []
    if (s === this.lastSnapshot) return
    this.past.push(this.lastSnapshot)
    if (this.past.length > MAX) this.past.shift()
    this.lastSnapshot = s
  }

  sync(doc: ScriptDocument) {
    this.lastSnapshot = this.snap(doc)
  }

  /**
   * push() commits the document *before* a mutation. Typing updates the live
   * doc without a second push, so lastSnapshot can sit one step behind
   * `current`. Restoring past.pop() in that case also dropped the text typed
   * just before an ИНТ./ЭКСТ. insert. If current has moved on, undo returns
   * the last committed snapshot and leaves the older past in place.
   */
  undo(current: ScriptDocument): ScriptDocument | null {
    const currentSnap = this.snap(current)
    if (currentSnap !== this.lastSnapshot) {
      this.future.push(currentSnap)
      return this.restore(this.lastSnapshot)
    }
    if (!this.past.length) return null
    this.future.push(currentSnap)
    const prev = this.past.pop()!
    this.lastSnapshot = prev
    return this.restore(prev)
  }

  redo(current: ScriptDocument): ScriptDocument | null {
    if (!this.future.length) return null
    this.past.push(this.snap(current))
    const next = this.future.pop()!
    this.lastSnapshot = next
    return this.restore(next)
  }

  canUndo() {
    return this.past.length > 0
  }

  canRedo() {
    return this.future.length > 0
  }
}
