import { detectTypeFromText } from '../model/fountain'
import {
  createElement,
  type ElementType,
  type ScriptDocument,
  type ScriptElement,
} from '../model/types'
import { getSuggestions, sluglineTemplate, type Suggestion } from './autocomplete'
import { getTextareaRangeRects } from './textarea-coords'
import {
  renameCharacterInElements,
  replaceInElements,
} from './find'
import {
  applyAutoCaps,
  isEmptyLineForTab,
  looksLikeCharacterCue,
  looksLikeCharacterName,
  nextType,
  typeAfterCmdEnter,
  typeAfterEnter,
  TYPE_LABELS,
} from './keymap'
import { applyAutoContd, recentSpeakers } from './smart'
import { paginate, type DisplayLine } from '../layout/paginate'
import { detectTextLanguage, findGrammarIssues } from './grammar'

export type EditorCallbacks = {
  onChange: (doc: ScriptDocument) => void
  onFocusType: (type: ElementType | null) => void
  onFocusIndex: (index: number) => void
  onBeforeMutate: () => void
}

function autosize(el: HTMLTextAreaElement) {
  el.style.height = 'auto'
  el.style.height = `${Math.max(el.scrollHeight, 16)}px`
}

function setCaret(el: HTMLTextAreaElement, pos: number) {
  requestAnimationFrame(() => {
    el.focus()
    const p = Math.max(0, Math.min(pos, el.value.length))
    el.setSelectionRange(p, p)
  })
}

export class ScriptEditor {
  private root: HTMLElement
  private doc: ScriptDocument
  private callbacks: EditorCallbacks
  private focusIndex = 0
  private acEl: HTMLUListElement | null = null
  private acItems: Suggestion[] = []
  private acIndex = 0
  private suppressAc = false
  private rerenderTimer: number | undefined
  private savedCaret: { id: string; start: number; end: number } | null = null
  private typingSession = false
  /** When false, render does not focus the matched textarea (keeps find-bar focus). */
  private focusAfterRender = true
  /** Ignore blur-driven autocomplete hide while render() swaps textareas. */
  private rebuilding = false
  private renderGen = 0
  private grammarEnabled = true
  private grammarPaintFrame: number | undefined
  /** After Enter, open suggestions once focus lands on the new line. */
  private pendingAc = false
  private acAnchor: HTMLTextAreaElement | null = null
  private acAnchorId: string | null = null
  private acScrollEl: HTMLElement | null = null
  private readonly onAcScroll = () => {
    this.repositionAutocomplete()
  }

  constructor(
    root: HTMLElement,
    doc: ScriptDocument,
    callbacks: EditorCallbacks,
  ) {
    this.root = root
    this.doc = doc
    this.callbacks = callbacks
    window.addEventListener('scroll', this.onAcScroll, true)
    this.root.parentElement?.addEventListener('scroll', this.onAcScroll, {
      passive: true,
    })
  }

  /** Type-bar and ⌘/Ctrl+1–6: same rules as changeType. */
  setFocusedLineType(type: ElementType) {
    const el = this.doc.elements[this.focusIndex]
    if (!el) return
    const ta = this.root.querySelector(
      `textarea[data-id="${el.id}"]`,
    ) as HTMLTextAreaElement | null
    if (!ta) return
    if (el.type === type && ta.value === el.text) {
      ta.focus()
      return
    }
    if (ta.value !== el.text) el.text = ta.value
    const caret = ta.selectionStart ?? ta.value.length
    this.changeType(el, ta, type)
    const pos = Math.min(caret, ta.value.length)
    this.savedCaret = { id: el.id, start: pos, end: pos }
    ta.focus()
    ta.setSelectionRange(pos, pos)
  }

  getDocument(): ScriptDocument {
    return this.doc
  }

  getFocusIndex(): number {
    return this.focusIndex
  }

  setDocument(doc: ScriptDocument) {
    this.doc = doc
    this.focusIndex = Math.min(this.focusIndex, Math.max(0, doc.elements.length - 1))
    this.render()
  }

  setFormat(format: ScriptDocument['format']) {
    this.callbacks.onBeforeMutate()
    this.doc = { ...this.doc, format }
    this.root.classList.remove('format-us', 'format-ru')
    this.root.classList.add(`format-${format}`)
    this.render()
    this.emit()
  }

  setGrammarEnabled(enabled: boolean) {
    this.grammarEnabled = enabled
    this.root.classList.toggle('grammar-enabled', enabled)
    this.root.querySelectorAll('textarea.line').forEach((node) => {
      const ta = node as HTMLTextAreaElement
      this.updateTextareaGrammarState(ta)
    })
    if (enabled) this.scheduleGrammarPaint()
    else this.clearGrammarOverlayDom()
  }

  updateTitlePage(partial: Partial<ScriptDocument['titlePage']>) {
    this.callbacks.onBeforeMutate()
    this.doc = {
      ...this.doc,
      titlePage: { ...this.doc.titlePage, ...partial },
    }
    this.emit()
    this.renderTitleOnly()
  }

  jumpToElement(id: string) {
    const idx = this.indexOfId(id)
    if (idx < 0) return
    this.focusIndex = idx
    this.savedCaret = { id, start: 0, end: 0 }
    this.focusAfterRender = true
    this.render()
    const ta = this.root.querySelector(
      `textarea[data-id="${id}"]`,
    ) as HTMLTextAreaElement | null
    ta?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    if (ta) {
      requestAnimationFrame(() => {
        ta.focus()
        ta.setSelectionRange(0, 0)
      })
    }
  }

  private emit() {
    this.callbacks.onChange(this.doc)
    this.callbacks.onFocusIndex(this.focusIndex)
  }

  private mutate(fn: () => void) {
    this.typingSession = false
    this.callbacks.onBeforeMutate()
    fn()
  }

  private beginTyping() {
    if (!this.typingSession) {
      this.typingSession = true
      this.callbacks.onBeforeMutate()
    }
  }

  private updateElement(id: string, patch: Partial<ScriptElement>) {
    this.doc = {
      ...this.doc,
      elements: this.doc.elements.map((el) =>
        el.id === id ? { ...el, ...patch } : el,
      ),
    }
    this.emit()
  }

  private indexOfId(id: string): number {
    return this.doc.elements.findIndex((e) => e.id === id)
  }

  scheduleRerender() {
    window.clearTimeout(this.rerenderTimer)
    this.rerenderTimer = window.setTimeout(() => {
      this.render()
    }, 500)
  }

  render() {
    const gen = ++this.renderGen
    this.rebuilding = true
    const keepAc = this.acItems.length > 0
    const keepAcId = this.acAnchorId
    const scrollTop = this.root.querySelector('.script-scroll')?.scrollTop ?? 0
    const activeId =
      this.savedCaret?.id ?? this.doc.elements[this.focusIndex]?.id
    const caretStart = this.savedCaret?.start
    const caretEnd = this.savedCaret?.end
    this.savedCaret = null
    this.detachAcScroll()

    this.root.classList.remove('format-us', 'format-ru')
    this.root.classList.add(`format-${this.doc.format}`)

    const scroll = document.createElement('div')
    scroll.className = 'script-scroll'

    scroll.appendChild(this.buildTitlePage())

    const display = paginate(this.doc.elements, this.doc.format)
    const pages = this.groupByPage(display)

    for (const [pageNum, lines] of pages) {
      const page = document.createElement('div')
      page.className = 'page'
      page.dataset.page = String(pageNum)

      const num = document.createElement('div')
      num.className = 'page__number' + (pageNum === 1 ? ' is-hidden' : '')
      num.textContent = `${pageNum}.`
      page.appendChild(num)

      const body = document.createElement('div')
      body.className = 'page__body'

      for (const line of lines) {
        if (line.kind === 'page_break') continue
        if (line.kind === 'more') {
          const d = document.createElement('div')
          d.className = 'line line--more'
          d.textContent = '(MORE)'
          body.appendChild(d)
          continue
        }
        if (line.kind === 'contd') {
          const d = document.createElement('div')
          d.className = 'line line--contd line--character'
          d.textContent = `${line.name} (CONT'D)`
          body.appendChild(d)
          continue
        }
        if (line.kind === 'element') {
          if (line.editable) {
            body.appendChild(this.buildLineInput(line.element))
          } else {
            body.appendChild(
              this.buildDisplayLine(
                line.element,
                line.displayText ?? line.element.text,
              ),
            )
          }
        }
      }

      page.appendChild(body)
      scroll.appendChild(page)
    }

    this.root.replaceChildren(scroll)
    scroll.scrollTop = scrollTop
    this.attachAcScroll(scroll)

    const finishRebuild = () => {
      if (gen === this.renderGen) this.rebuilding = false
    }

    if (activeId) {
      const ta = this.root.querySelector(
        `textarea[data-id="${activeId}"]`,
      ) as HTMLTextAreaElement | null
      if (ta) {
        const start = caretStart ?? ta.value.length
        const end = caretEnd ?? start
        const shouldFocus = this.focusAfterRender
        this.focusAfterRender = true
        requestAnimationFrame(() => {
          if (gen !== this.renderGen) return
          const s = Math.min(start, ta.value.length)
          const e = Math.min(end, ta.value.length)
          const focused = this.doc.elements.find((x) => x.id === activeId)
          if (shouldFocus) {
            ta.focus()
            ta.setSelectionRange(s, e)
            if (focused) this.callbacks.onFocusType(focused.type)
            const reopen =
              this.pendingAc || (keepAc && keepAcId === activeId)
            this.pendingAc = false
            if (reopen && focused) this.showAutocomplete(ta, focused)
          } else {
            this.pendingAc = false
            // Reveal match without stealing focus from find bar
            try {
              ta.setSelectionRange(s, e)
            } catch {
              /* ignore */
            }
            ta.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }
          finishRebuild()
        })
      } else {
        this.focusAfterRender = true
        this.pendingAc = false
        finishRebuild()
      }
    } else {
      this.focusAfterRender = true
      this.pendingAc = false
      finishRebuild()
    }

    this.root.querySelectorAll('textarea.line').forEach((node) => {
      autosize(node as HTMLTextAreaElement)
    })

    this.callbacks.onFocusIndex(this.focusIndex)
    this.paintFindHighlight()
    this.scheduleGrammarPaint()
  }

  private renderTitleOnly() {
    const existing = this.root.querySelector('.title-page')
    if (existing) existing.replaceWith(this.buildTitlePage())
  }

  private buildTitlePage(): HTMLElement {
    const page = document.createElement('div')
    page.className = 'page title-page'
    const tp = this.doc.titlePage

    const title = document.createElement('div')
    title.className = 'title-page__title'
    title.textContent = tp.title || 'БЕЗ НАЗВАНИЯ'
    page.appendChild(title)

    if (tp.author) {
      const by = document.createElement('div')
      by.className = 'title-page__by'
      by.textContent = this.doc.format === 'ru' ? 'Автор' : 'Written by'
      page.appendChild(by)
      const author = document.createElement('div')
      author.className = 'title-page__author'
      author.textContent = tp.author
      page.appendChild(author)
    }

    const meta = document.createElement('div')
    meta.className = 'title-page__meta'
    const parts: string[] = []
    if (tp.draftDate) parts.push(tp.draftDate)
    if (tp.contact) parts.push(tp.contact)
    meta.textContent = parts.join('\n')
    page.appendChild(meta)
    return page
  }

  private groupByPage(display: DisplayLine[]): Map<number, DisplayLine[]> {
    const map = new Map<number, DisplayLine[]>()
    for (const line of display) {
      if (line.kind === 'page_break') continue
      const list = map.get(line.page) ?? []
      list.push(line)
      map.set(line.page, list)
    }
    if (map.size === 0) map.set(1, [])
    return map
  }

  private buildDisplayLine(el: ScriptElement, text: string): HTMLElement {
    const d = document.createElement('div')
    d.className = `line line--${el.type} line--display`
    d.textContent = text
    d.dataset.id = el.id
    return d
  }

  /** Current find match to paint as a yellow mark overlay (no focus steal). */
  private findHighlight: { id: string; start: number; end: number } | null =
    null

  setFindHighlight(id: string, start: number, end: number) {
    this.findHighlight = { id, start, end }
    // Wait for layout/fonts so mirror metrics match the textarea
    requestAnimationFrame(() => {
      requestAnimationFrame(() => this.paintFindHighlight())
    })
  }

  clearFindHighlight() {
    this.findHighlight = null
    this.clearFindOverlayDom()
  }

  private clearFindOverlayDom() {
    this.root.querySelectorAll('.line-find-rect').forEach((n) => n.remove())
    this.root.querySelectorAll('.line-find-overlay').forEach((n) => n.remove())
    this.root.querySelectorAll('.line-wrap.is-find-hit').forEach((n) => {
      n.classList.remove('is-find-hit')
    })
  }

  private clearGrammarOverlayDom(scope: ParentNode = this.root) {
    scope.querySelectorAll('.line-grammar-rect').forEach((node) => node.remove())
  }

  private scheduleGrammarPaint(only?: HTMLTextAreaElement) {
    window.cancelAnimationFrame(this.grammarPaintFrame ?? 0)
    this.grammarPaintFrame = window.requestAnimationFrame(() => {
      this.grammarPaintFrame = window.requestAnimationFrame(() => {
        if (!this.grammarEnabled) return
        if (only?.isConnected) this.paintGrammarForTextarea(only)
        else this.paintGrammarHighlights()
      })
    })
  }

  private paintGrammarHighlights() {
    this.clearGrammarOverlayDom()
    this.root.querySelectorAll('textarea.line').forEach((node) => {
      this.paintGrammarForTextarea(node as HTMLTextAreaElement)
    })
  }

  private paintGrammarForTextarea(ta: HTMLTextAreaElement) {
    const wrap = ta.closest('.line-wrap') as HTMLElement | null
    if (!wrap) return
    this.clearGrammarOverlayDom(wrap)
    if (!this.shouldCheckGrammar(ta)) return

    for (const issue of findGrammarIssues(ta.value)) {
      const rects = getTextareaRangeRects(ta, issue.start, issue.end, wrap)
      for (const rect of rects) {
        const mark = document.createElement('span')
        mark.className = 'line-grammar-rect'
        mark.setAttribute('aria-hidden', 'true')
        mark.dataset.language = issue.language
        mark.title = issue.message
        mark.style.left = `${rect.left}px`
        mark.style.top = `${rect.top}px`
        mark.style.width = `${rect.width}px`
        mark.style.height = `${Math.max(rect.height, 12)}px`
        wrap.appendChild(mark)
      }
    }
  }

  private shouldCheckGrammar(ta: HTMLTextAreaElement): boolean {
    return (
      this.grammarEnabled &&
      (ta.dataset.type === 'action' ||
        ta.dataset.type === 'dialogue' ||
        ta.dataset.type === 'parenthetical')
    )
  }

  private updateTextareaGrammarState(ta: HTMLTextAreaElement) {
    const enabled = this.shouldCheckGrammar(ta)
    ta.spellcheck = enabled
    ta.setAttribute('spellcheck', enabled ? 'true' : 'false')
    ta.lang = detectTextLanguage(ta.value)
    if (!enabled) {
      const wrap = ta.closest('.line-wrap')
      if (wrap) this.clearGrammarOverlayDom(wrap)
    }
  }

  private paintFindHighlight() {
    this.clearFindOverlayDom()
    const hit = this.findHighlight
    if (!hit || hit.end <= hit.start) return

    const ta = this.root.querySelector(
      `textarea[data-id="${hit.id}"]`,
    ) as HTMLTextAreaElement | null
    if (!ta) return

    let wrap = ta.closest('.line-wrap') as HTMLElement | null
    if (!wrap) {
      wrap = document.createElement('div')
      wrap.className = 'line-wrap'
      ta.parentElement?.insertBefore(wrap, ta)
      wrap.appendChild(ta)
    }
    wrap.classList.add('is-find-hit')

    const text = ta.value
    const start = Math.max(0, Math.min(hit.start, text.length))
    const end = Math.max(start, Math.min(hit.end, text.length))

    // Position highlight rects by measuring a style-mirrored clone (not a text overlay)
    const rects = getTextareaRangeRects(ta, start, end, wrap)
    for (const r of rects) {
      const mark = document.createElement('div')
      mark.className = 'line-find-rect'
      mark.setAttribute('aria-hidden', 'true')
      mark.style.left = `${r.left}px`
      mark.style.top = `${r.top}px`
      mark.style.width = `${r.width}px`
      mark.style.height = `${Math.max(r.height, 12)}px`
      wrap.appendChild(mark)
    }

    wrap.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }

  private buildLineInput(el: ScriptElement): HTMLElement {
    const wrap = document.createElement('div')
    wrap.className = 'line-wrap'

    const ta = document.createElement('textarea')
    ta.className = `line line--${el.type}`
    ta.dataset.id = el.id
    ta.dataset.type = el.type
    ta.rows = 1
    ta.setAttribute('autocomplete', 'off')
    ta.setAttribute('autocapitalize', 'off')
    ta.setAttribute('autocorrect', 'off')
    ta.value = el.text
    this.updateTextareaGrammarState(ta)
    ta.setAttribute('aria-label', TYPE_LABELS[el.type])

    ta.addEventListener('focus', () => {
      const idx = this.indexOfId(el.id)
      this.focusIndex = idx
      const live = this.doc.elements[idx]
      this.callbacks.onFocusType(live?.type ?? el.type)
      this.callbacks.onFocusIndex(this.focusIndex)
    })

    ta.addEventListener('input', () => {
      this.beginTyping()
      let text = ta.value
      const live = this.doc.elements[this.indexOfId(el.id)]
      let type = live?.type ?? el.type

      const detected = detectTypeFromText(
        text,
        this.doc.elements[this.indexOfId(el.id) - 1]?.type,
      )
      if (detected && detected !== type && type === 'action') {
        type = detected
        ta.dataset.type = type
        ta.className = `line line--${type}`
      }

      if (
        type === 'scene_heading' ||
        type === 'character' ||
        type === 'transition'
      ) {
        const start = ta.selectionStart
        let capped = applyAutoCaps(type, text)
        if (type === 'character') {
          capped = applyAutoContd(
            capped,
            this.doc.elements,
            this.indexOfId(el.id),
          )
        }
        if (capped !== text) {
          const atEnd = start >= text.length
          text = capped
          ta.value = text
          const pos = atEnd ? text.length : Math.min(start, text.length)
          ta.setSelectionRange(pos, pos)
        }
      }

      this.updateElement(el.id, { text, type })
      el.text = text
      el.type = type
      this.updateTextareaGrammarState(ta)
      autosize(ta)
      this.scheduleGrammarPaint(ta)

      this.savedCaret = {
        id: el.id,
        start: ta.selectionStart,
        end: ta.selectionEnd,
      }
      this.scheduleRerender()

      if (!this.suppressAc) this.showAutocomplete(ta, el)
      else this.hideAutocomplete()
    })

    ta.addEventListener('keydown', (e) => {
      const live = this.doc.elements[this.indexOfId(el.id)] ?? el
      this.onKeyDown(e, live, ta)
    })
    ta.addEventListener('blur', () => {
      if (this.rebuilding) return
      window.setTimeout(() => {
        if (this.rebuilding) return
        const active = document.activeElement
        if (
          active instanceof HTMLTextAreaElement &&
          active.dataset.id === el.id
        ) {
          return
        }
        this.hideAutocomplete()
      }, 150)
    })

    wrap.appendChild(ta)
    return wrap
  }

  private focusLine(index: number, caret: 'start' | 'end' = 'end') {
    if (index < 0 || index >= this.doc.elements.length) return
    this.focusIndex = index
    const id = this.doc.elements[index].id
    const ta = this.root.querySelector(
      `textarea[data-id="${id}"]`,
    ) as HTMLTextAreaElement | null
    if (!ta) {
      this.savedCaret = {
        id,
        start: caret === 'start' ? 0 : 99999,
        end: caret === 'start' ? 0 : 99999,
      }
      this.render()
      return
    }
    ta.focus()
    const pos = caret === 'start' ? 0 : ta.value.length
    ta.setSelectionRange(pos, pos)
    this.callbacks.onFocusType(this.doc.elements[index].type)
    this.callbacks.onFocusIndex(index)
  }

  private onKeyDown(
    e: KeyboardEvent,
    el: ScriptElement,
    ta: HTMLTextAreaElement,
  ) {
    if (e.key === 'Tab' && isEmptyLineForTab(el.type, ta.value)) {
      e.preventDefault()
      this.hideAutocomplete()
      this.changeType(el, ta, nextType(el.type, e.shiftKey))
      return
    }

    if (this.acEl && this.acItems.length) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        this.acIndex = (this.acIndex + 1) % this.acItems.length
        this.paintAc()
        return
      }
      if (e.key === 'ArrowUp' || (e.key === 'Tab' && e.shiftKey)) {
        e.preventDefault()
        this.acIndex =
          (this.acIndex - 1 + this.acItems.length) % this.acItems.length
        this.paintAc()
        return
      }
      if (e.key === 'Tab') {
        e.preventDefault()
        const item = this.acItems[this.acIndex]
        if (item) this.applySuggestion(ta, el, item)
        return
      }
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        const item = this.acItems[this.acIndex]
        if (item) this.applySuggestion(ta, el, item)
        return
      }
      if (e.key === 'Escape') {
        e.preventDefault()
        this.hideAutocomplete()
        return
      }
    }

    // Arrow navigation between blocks at line edges
    if (e.key === 'ArrowUp' && ta.selectionStart === 0 && ta.selectionEnd === 0) {
      const idx = this.indexOfId(el.id)
      if (idx > 0) {
        e.preventDefault()
        this.focusLine(idx - 1, 'end')
        return
      }
    }
    if (
      e.key === 'ArrowDown' &&
      ta.selectionStart === ta.value.length &&
      ta.selectionEnd === ta.value.length
    ) {
      const idx = this.indexOfId(el.id)
      if (idx < this.doc.elements.length - 1) {
        e.preventDefault()
        this.focusLine(idx + 1, 'start')
        return
      }
    }

    if (e.key === 'Tab') {
      e.preventDefault()
      if (!isEmptyLineForTab(el.type, ta.value)) return
      const type = nextType(el.type, e.shiftKey)
      this.changeType(el, ta, type)
      return
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (e.metaKey || e.ctrlKey) {
        this.handleEnter(el, ta, true)
      } else {
        this.handleEnter(el, ta, false)
      }
      return
    }

    if (e.key === 'Backspace' && ta.value === '' && this.doc.elements.length > 1) {
      e.preventDefault()
      this.deleteLine(el)
      return
    }

    if (e.ctrlKey || e.metaKey) {
      if (e.key === '1') {
        e.preventDefault()
        this.changeType(el, ta, 'scene_heading')
      } else if (e.key === '2') {
        e.preventDefault()
        this.changeType(el, ta, 'action')
      } else if (e.key === '3') {
        e.preventDefault()
        this.changeType(el, ta, 'character')
      } else if (e.key === '4') {
        e.preventDefault()
        this.changeType(el, ta, 'dialogue')
      } else if (e.key === '5') {
        e.preventDefault()
        this.changeType(el, ta, 'parenthetical')
      } else if (e.key === '6') {
        e.preventDefault()
        this.changeType(el, ta, 'transition')
      }
    }
  }

  private changeType(
    el: ScriptElement,
    ta: HTMLTextAreaElement,
    type: ElementType,
  ) {
    this.typingSession = false
    this.callbacks.onBeforeMutate()
    let text = el.text
    const trimmed = text.trim()
    if (
      type === 'parenthetical' &&
      trimmed &&
      !trimmed.startsWith('(') &&
      !looksLikeCharacterCue(trimmed)
    ) {
      text = `(${trimmed})`
    }
    text = applyAutoCaps(type, text)
    if (type === 'character') {
      text = applyAutoContd(text, this.doc.elements, this.indexOfId(el.id))
    }
    this.updateElement(el.id, { type, text })
    el.type = type
    el.text = text
    ta.value = text
    ta.dataset.type = type
    ta.className = `line line--${type}`
    this.updateTextareaGrammarState(ta)
    this.callbacks.onFocusType(type)
    autosize(ta)
    const pos = ta.selectionStart ?? text.length
    this.savedCaret = { id: el.id, start: pos, end: pos }
    this.showAutocomplete(ta, el)
  }

  private handleEnter(
    el: ScriptElement,
    ta: HTMLTextAreaElement,
    cmdEnter: boolean,
  ) {
    const idx = this.indexOfId(el.id)
    const full = ta.value
    const commitWhole =
      el.type === 'scene_heading' ||
      el.type === 'character' ||
      el.type === 'transition' ||
      el.type === 'parenthetical'
    const caret = ta.selectionStart ?? full.length
    const before = commitWhole ? full : full.slice(0, caret)
    const after = commitWhole ? '' : full.slice(caret)

    const newType = cmdEnter
      ? typeAfterCmdEnter(el.type)
      : typeAfterEnter(el.type, full)
    const beforeText = applyAutoCaps(el.type, before)

    // Action that looks like character name → convert
    if (
      el.type === 'action' &&
      looksLikeCharacterName(beforeText) &&
      !after
    ) {
      this.mutate(() => {
        const charText = applyAutoContd(
          beforeText.trim(),
          this.doc.elements,
          idx,
        )
        this.updateElement(el.id, { type: 'character', text: charText })
        const neu = createElement('dialogue', '')
        this.doc = {
          ...this.doc,
          elements: [
            ...this.doc.elements.slice(0, idx + 1),
            neu,
            ...this.doc.elements.slice(idx + 1),
          ],
        }
        this.focusIndex = idx + 1
        this.savedCaret = { id: neu.id, start: 0, end: 0 }
        this.emit()
        this.render()
      })
      return
    }

    this.mutate(() => {
      this.updateElement(el.id, { text: beforeText })

      let seed = after
      if (newType === 'parenthetical' && !seed) seed = '()'
      if (newType === 'scene_heading' && !seed) {
        seed = sluglineTemplate('int', this.doc.format).text
      }
      if (newType === 'character' && !seed) {
        seed = ''
      }

      let text = applyAutoCaps(newType, seed)
      if (newType === 'character' && text) {
        text = applyAutoContd(text, this.doc.elements, idx + 1)
      }

      const neu = createElement(newType, text)
      this.doc = {
        ...this.doc,
        elements: [
          ...this.doc.elements.slice(0, idx + 1),
          neu,
          ...this.doc.elements.slice(idx + 1),
        ],
      }
      this.focusIndex = idx + 1

      let caretPos = 0
      if (
        newType === 'scene_heading' &&
        text === sluglineTemplate('int', this.doc.format).text
      ) {
        caretPos = sluglineTemplate('int', this.doc.format).cursor
      } else if (newType === 'parenthetical') {
        caretPos = Math.min(1, text.length)
      }
      this.savedCaret = { id: neu.id, start: caretPos, end: caretPos }
      if (newType === 'character' && !text) this.pendingAc = true
      this.emit()
      this.render()
    })
  }

  private deleteLine(el: ScriptElement) {
    const idx = this.indexOfId(el.id)
    if (idx < 0 || this.doc.elements.length <= 1) return
    this.hideAutocomplete()
    this.mutate(() => {
      this.doc = {
        ...this.doc,
        elements: this.doc.elements.filter((e) => e.id !== el.id),
      }
      this.focusIndex = Math.max(0, idx - 1)
      const target = this.doc.elements[this.focusIndex]
      const pos = target?.text.length ?? 0
      if (target) this.savedCaret = { id: target.id, start: pos, end: pos }
      this.emit()
      this.render()
    })
  }

  private showAutocomplete(ta: HTMLTextAreaElement, el: ScriptElement) {
    let items = getSuggestions(
      el.type,
      ta.value,
      this.doc.elements,
      this.doc.format,
    )

    // Empty character line: prioritize recent speakers
    if (el.type === 'character' && !ta.value.trim()) {
      const recent = recentSpeakers(this.doc.elements)
      items = [
        ...recent.map((n) => ({ label: n, insert: n })),
        ...items.filter((s) => !recent.includes(s.insert)),
      ].slice(0, 8)
    }

    if (!items.length) {
      this.hideAutocomplete()
      return
    }
    this.acItems = items
    this.acIndex = 0

    if (!this.acEl) {
      this.acEl = document.createElement('ul')
      this.acEl.className = 'autocomplete'
      this.acEl.setAttribute('role', 'listbox')
      document.body.appendChild(this.acEl)
    }

    this.acAnchor = ta
    this.acAnchorId = el.id
    this.repositionAutocomplete()
    this.paintAc()
  }

  private repositionAutocomplete() {
    if (!this.acEl || !this.acAnchor || !this.acAnchor.isConnected) return
    const rect = this.acAnchor.getBoundingClientRect()
    this.acEl.style.position = 'fixed'
    this.acEl.style.left = `${rect.left}px`
    this.acEl.style.top = `${rect.bottom + 2}px`
  }

  private attachAcScroll(scroll: HTMLElement) {
    this.acScrollEl = scroll
    scroll.addEventListener('scroll', this.onAcScroll, { passive: true })
  }

  private detachAcScroll() {
    this.acScrollEl?.removeEventListener('scroll', this.onAcScroll)
    this.acScrollEl = null
  }

  private paintAc() {
    if (!this.acEl) return
    this.acEl.replaceChildren()
    this.acItems.forEach((item, i) => {
      const li = document.createElement('li')
      li.textContent = item.label
      li.setAttribute('role', 'option')
      li.setAttribute('aria-selected', String(i === this.acIndex))
      const activate = (e: Event) => {
        e.preventDefault()
        this.chooseSuggestion(item)
      }
      li.addEventListener('pointerdown', activate)
      li.addEventListener('mousedown', activate)
      this.acEl!.appendChild(li)
    })
  }

  private hideAutocomplete() {
    this.acItems = []
    this.acIndex = 0
    this.acAnchor = null
    this.acAnchorId = null
    this.acEl?.remove()
    this.acEl = null
  }

  private chooseSuggestion(item: Suggestion) {
    if (!this.acItems.length) return
    const id = this.acAnchorId ?? this.doc.elements[this.focusIndex]?.id
    if (!id) return
    const ta = this.root.querySelector(
      `textarea[data-id="${id}"]`,
    ) as HTMLTextAreaElement | null
    const target = this.doc.elements.find((e) => e.id === id)
    if (!ta || !target) return
    this.applySuggestion(ta, target, item)
  }

  private applySuggestion(
    ta: HTMLTextAreaElement,
    el: ScriptElement,
    item: Suggestion,
  ) {
    this.suppressAc = true
    this.typingSession = false
    this.callbacks.onBeforeMutate()
    let insert = item.insert
    if (el.type === 'character') {
      insert = applyAutoContd(insert, this.doc.elements, this.indexOfId(el.id))
    }
    insert = applyAutoCaps(el.type, insert)
    this.updateElement(el.id, { text: insert })
    el.text = insert
    const advance = el.type === 'character' || el.type === 'parenthetical'
    this.hideAutocomplete()
    if (advance) {
      this.advanceToDialogue(el.id)
    } else if (ta.isConnected) {
      ta.value = insert
      const cursor = item.cursor ?? insert.length
      this.savedCaret = { id: el.id, start: cursor, end: cursor }
      setCaret(ta, cursor)
      autosize(ta)
    }
    window.setTimeout(() => {
      this.suppressAc = false
    }, 0)
  }

  /** After a character or parenthetical suggestion, land in the next dialogue. */
  private advanceToDialogue(fromId: string) {
    const idx = this.indexOfId(fromId)
    if (idx < 0) return
    const next = this.doc.elements[idx + 1]
    if (next && next.type === 'dialogue' && next.text.trim() === '') {
      this.focusIndex = idx + 1
      this.savedCaret = { id: next.id, start: 0, end: 0 }
      this.render()
      return
    }
    const neu = createElement('dialogue', '')
    this.doc = {
      ...this.doc,
      elements: [
        ...this.doc.elements.slice(0, idx + 1),
        neu,
        ...this.doc.elements.slice(idx + 1),
      ],
    }
    this.focusIndex = idx + 1
    this.savedCaret = { id: neu.id, start: 0, end: 0 }
    this.emit()
    this.render()
  }

  insertSlugline(kind: 'int' | 'ext') {
    const idx = this.focusIndex
    const { text, cursor } = sluglineTemplate(kind, this.doc.format)
    this.mutate(() => {
      const neu = createElement('scene_heading', text)
      const action = createElement('action', '')
      this.doc = {
        ...this.doc,
        elements: [
          ...this.doc.elements.slice(0, idx + 1),
          neu,
          action,
          ...this.doc.elements.slice(idx + 1),
        ],
      }
      this.focusIndex = idx + 1
      this.savedCaret = { id: neu.id, start: cursor, end: cursor }
      this.emit()
      this.render()
    })
  }

  jumpToMatch(
    elementId: string,
    start: number,
    end: number,
    options: { focus?: boolean } = {},
  ) {
    this.focusIndex = Math.max(0, this.indexOfId(elementId))
    this.savedCaret = { id: elementId, start, end }
    this.findHighlight = { id: elementId, start, end }
    this.focusAfterRender = options.focus !== false
    this.render()
    const ta = this.root.querySelector(
      `textarea[data-id="${elementId}"]`,
    ) as HTMLTextAreaElement | null
    ta?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  replaceAllCounted(query: string, replacement: string): number {
    if (!query) return 0
    const { elements, count } = replaceInElements(
      this.doc.elements,
      query,
      replacement,
    )
    if (count === 0) return 0
    this.mutate(() => {
      this.doc = { ...this.doc, elements }
      this.emit()
      this.render()
    })
    return count
  }

  replaceOne(
    elementId: string,
    start: number,
    end: number,
    replacement: string,
  ) {
    const el = this.doc.elements.find((e) => e.id === elementId)
    if (!el) return
    this.mutate(() => {
      const text = el.text.slice(0, start) + replacement + el.text.slice(end)
      this.doc = {
        ...this.doc,
        elements: this.doc.elements.map((e) =>
          e.id === elementId ? { ...e, text } : e,
        ),
      }
      this.emit()
      this.savedCaret = {
        id: elementId,
        start: start + replacement.length,
        end: start + replacement.length,
      }
      this.render()
    })
  }

  renameCharacter(from: string, to: string): number {
    const next = renameCharacterInElements(this.doc.elements, from, to)
    let changed = 0
    for (let i = 0; i < next.length; i++) {
      if (next[i].text !== this.doc.elements[i].text) changed++
    }
    if (!changed) return 0
    this.mutate(() => {
      this.doc = { ...this.doc, elements: next }
      this.emit()
      this.render()
    })
    return changed
  }
}
