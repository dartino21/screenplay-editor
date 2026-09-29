import { pageCount, sceneCount, wordCount, paginate } from '../layout/paginate'
import type { ElementType, FormatPreset, ScriptDocument } from '../model/types'
import { TYPE_LABELS } from '../editor/keymap'
import { collectScenes, activeSceneId } from '../editor/smart'

export interface ToolbarHandlers {
  onFormat: (format: FormatPreset) => void
  onTitle: (title: string) => void
  onExportFountain: () => void
  onImportFountain: () => void
  onPrint: () => void
  onNew: () => void
  onInsertInt: () => void
  onInsertExt: () => void
  onMeta: (field: 'author' | 'draftDate' | 'contact', value: string) => void
  onFocusMode: () => void
  onToggleOutline: () => void
  onToggleMeta: () => void
  onUndo: () => void
  onRedo: () => void
  onHelp: () => void
  onJumpScene: (elementId: string) => void
  onFind: () => void
  onRenameCharacter: () => void
  onSetType: (type: ElementType) => void
}

export function renderShell(app: HTMLElement): {
  toolbar: HTMLElement
  meta: HTMLElement
  editorRoot: HTMLElement
  outline: HTMLElement
  help: HTMLElement
  updateStats: (doc: ScriptDocument) => void
  updateTypeHint: (type: ElementType | null) => void
  setFormatButtons: (format: FormatPreset) => void
  setTitle: (title: string) => void
  updateOutline: (doc: ScriptDocument, focusIndex: number) => void
  setFocusMode: (on: boolean) => void
  setOutlineOpen: (on: boolean) => void
  setMetaOpen: (on: boolean) => void
  showHelp: () => void
  showTip: (show: boolean) => void
  showFind: (show: boolean) => void
  getFindQuery: () => { query: string; replace: string }
  setFindCount: (text: string) => void
} {
  app.innerHTML = `
    <div class="chrome">
    <header class="toolbar" id="toolbar">
      <span class="toolbar__brand">Сценарий</span>
      <input class="toolbar__title" id="doc-title" type="text" spellcheck="false" aria-label="Название" />
      <div class="toolbar__sep"></div>
      <div class="seg" role="group" aria-label="Формат">
        <button type="button" data-format="us" id="fmt-us" title="Hollywood / US Letter">US</button>
        <button type="button" data-format="ru" id="fmt-ru" title="Российский / A4">RU</button>
      </div>
      <div class="toolbar__group">
        <button type="button" class="btn" id="btn-int" title="Вставить INT.">INT.</button>
        <button type="button" class="btn" id="btn-ext" title="Вставить EXT.">EXT.</button>
      </div>
      <div class="toolbar__sep"></div>
      <button type="button" class="btn" id="btn-outline" title="Навигатор сцен (\\)">Сцены</button>
      <button type="button" class="btn" id="btn-meta" title="Титульный лист">Титул</button>
      <button type="button" class="btn" id="btn-focus" title="Режим фокуса (F)">Фокус</button>
      <button type="button" class="btn" id="btn-undo" title="Отменить (⌘Z)">↩</button>
      <button type="button" class="btn" id="btn-redo" title="Повторить (⌘⇧Z)">↪</button>
      <button type="button" class="btn" id="btn-find" title="Найти (⌘F)">Найти</button>
      <button type="button" class="btn" id="btn-rename" title="Переименовать персонажа">Имя</button>
      <div class="toolbar__sep"></div>
      <button type="button" class="btn" id="btn-import" title="Открыть .fountain">Импорт</button>
      <button type="button" class="btn" id="btn-export" title="Скачать .fountain">.fountain</button>
      <button type="button" class="btn" id="btn-print" title="Печать / PDF">PDF</button>
      <button type="button" class="btn btn--ghost" id="btn-new">Новый</button>
      <button type="button" class="btn btn--ghost" id="btn-help" title="Справка (F1)">?</button>
      <div class="stats" id="stats">
        <span>Сц. <strong id="stat-scenes">0</strong></span>
        <span>Стр. <strong id="stat-pages">1</strong></span>
        <span>~мин <strong id="stat-mins">1</strong></span>
        <span>Слов <strong id="stat-words">0</strong></span>
      </div>
    </header>
    <div class="typebar" id="typebar" role="group" aria-label="Тип блока">
      ${typebarButtons()}
    </div>
    <div class="find-bar" id="find-bar" hidden>
      <input id="find-query" type="search" placeholder="Найти…" aria-label="Найти" />
      <input id="find-replace" type="text" placeholder="Заменить на…" aria-label="Заменить" />
      <span class="find-bar__count" id="find-count"></span>
      <button type="button" class="btn" id="find-prev" title="Предыдущее">↑</button>
      <button type="button" class="btn" id="find-next" title="Следующее">↓</button>
      <button type="button" class="btn" id="find-do-replace">Заменить</button>
      <button type="button" class="btn" id="find-do-all">Все</button>
      <button type="button" class="btn btn--ghost" id="find-close">✕</button>
    </div>
    </div>
    <div class="meta-panel is-collapsed" id="meta" hidden>
      <label>Автор <input id="meta-author" type="text" /></label>
      <label>Черновик <input id="meta-draft" type="text" placeholder="Дата" /></label>
      <label>Контакт <input id="meta-contact" type="text" /></label>
    </div>
    <div class="layout" id="layout">
      <aside class="outline is-collapsed" id="outline" aria-label="Навигатор сцен" hidden>
        <div class="outline__head">Сцены</div>
        <nav class="outline__list" id="outline-list"></nav>
      </aside>
      <main class="workspace">
        <div id="editor-root"></div>
      </main>
    </div>
    <div class="tip" id="tip" hidden>
      <p><strong>Enter</strong> — следующий блок · пустой диалог + Enter — следующий персонаж · <strong>⌘↵</strong> — персонаж · полоска типов или <strong>⌘1–6</strong> — сменить тип · <strong>Tab</strong> меняет тип только на пустой строке, даже если открыт список · <strong>Enter</strong> и клик подтверждают пункт списка · <strong>F1</strong> — справка · «?» печатается</p>
      <button type="button" class="btn" id="tip-dismiss">Понятно</button>
    </div>
    <dialog class="help-dialog" id="help-dialog">
      <form method="dialog" class="help-dialog__inner">
        <h2>Клавиши</h2>
        <ul>
          <li><kbd>Enter</kbd> — следующий блок</li>
          <li>пустой диалог + <kbd>Enter</kbd> — следующий персонаж</li>
          <li><kbd>⌘</kbd>/<kbd>Ctrl</kbd>+<kbd>Enter</kbd> — персонаж</li>
          <li>полоска типов или <kbd>⌘</kbd>/<kbd>Ctrl</kbd>+<kbd>1–6</kbd> — сменить тип</li>
          <li><kbd>Tab</kbd> меняет тип только на пустой строке, даже если открыт список. <kbd>Enter</kbd> и клик подтверждают пункт списка.</li>
          <li><kbd>F1</kbd> — справка</li>
          <li>«?» в тексте печатается</li>
          <li><kbd>⌘</kbd>/<kbd>Ctrl</kbd>+<kbd>Z</kbd> / <kbd>⇧Z</kbd> — отмена / повтор</li>
          <li><kbd>⇧</kbd>+<kbd>Enter</kbd> — мягкий перенос в блоке</li>
          <li><kbd>⌘</kbd>/<kbd>Ctrl</kbd>+<kbd>F</kbd> — найти / заменить</li>
          <li><kbd>Alt</kbd>+<kbd>F</kbd> — режим фокуса · <kbd>Esc</kbd> — выйти из фокуса · <kbd>\\</kbd> — навигатор</li>
          <li><kbd>↑</kbd>/<kbd>↓</kbd> на краю строки — соседний блок</li>
        </ul>
        <p class="help-dialog__note">Авто: CAPS для сцены и имени, (CONT'D) при повторной реплике, (MORE) на разрыве страницы. 1 стр. ≈ 1 мин.</p>
        <button class="btn" value="ok">Закрыть</button>
      </form>
    </dialog>
    <input type="file" id="file-import" accept=".fountain,.txt,text/plain" hidden />
  `

  const toolbar = app.querySelector('#toolbar') as HTMLElement
  const meta = app.querySelector('#meta') as HTMLElement
  const editorRoot = app.querySelector('#editor-root') as HTMLElement
  const outline = app.querySelector('#outline') as HTMLElement
  const help = app.querySelector('#help-dialog') as HTMLElement

  function updateStats(doc: ScriptDocument) {
    const display = paginate(doc.elements, doc.format)
    const pages = pageCount(display)
    const scenes = sceneCount(doc.elements)
    const words = wordCount(doc.elements)
    ;(app.querySelector('#stat-scenes') as HTMLElement).textContent = String(scenes)
    ;(app.querySelector('#stat-pages') as HTMLElement).textContent = String(pages)
    ;(app.querySelector('#stat-mins') as HTMLElement).textContent = String(pages)
    ;(app.querySelector('#stat-words') as HTMLElement).textContent = String(words)
  }

  function updateTypeHint(type: ElementType | null) {
    app.querySelectorAll('.typebar__btn').forEach((node) => {
      const btn = node as HTMLButtonElement
      const on = btn.dataset.type === type
      btn.classList.toggle('is-active', on)
      btn.setAttribute('aria-pressed', on ? 'true' : 'false')
    })
  }

  function setFormatButtons(format: FormatPreset) {
    app.querySelectorAll('.seg button').forEach((btn) => {
      btn.classList.toggle('active', (btn as HTMLElement).dataset.format === format)
    })
    document.body.dataset.paper = format
    const intBtn = app.querySelector('#btn-int') as HTMLButtonElement
    const extBtn = app.querySelector('#btn-ext') as HTMLButtonElement
    if (format === 'ru') {
      intBtn.textContent = 'ИНТ.'
      extBtn.textContent = 'ЭКСТ.'
    } else {
      intBtn.textContent = 'INT.'
      extBtn.textContent = 'EXT.'
    }
  }

  function setTitle(title: string) {
    ;(app.querySelector('#doc-title') as HTMLInputElement).value = title
  }

  function updateOutline(doc: ScriptDocument, focusIndex: number) {
    const list = app.querySelector('#outline-list') as HTMLElement
    const scenes = collectScenes(doc.elements)
    const active = activeSceneId(doc.elements, focusIndex)
    list.replaceChildren()
    if (!scenes.length) {
      const empty = document.createElement('p')
      empty.className = 'outline__empty'
      empty.textContent = 'Нет сцен — вставьте INT./EXT.'
      list.appendChild(empty)
      return
    }
    for (const s of scenes) {
      const btn = document.createElement('button')
      btn.type = 'button'
      btn.className = 'outline__item' + (s.id === active ? ' is-active' : '')
      btn.dataset.id = s.id
      btn.innerHTML = `<span class="outline__num">${s.number}</span><span class="outline__text">${escapeHtml(s.text)}</span>`
      list.appendChild(btn)
    }
  }

  function setFocusMode(on: boolean) {
    document.body.classList.toggle('focus-mode', on)
    app.querySelector('#btn-focus')?.classList.toggle('active', on)
  }

  function setOutlineOpen(on: boolean) {
    outline.hidden = !on
    outline.classList.toggle('is-collapsed', !on)
    app.querySelector('#btn-outline')?.classList.toggle('active', on)
  }

  function setMetaOpen(on: boolean) {
    meta.hidden = !on
    meta.classList.toggle('is-collapsed', !on)
    app.querySelector('#btn-meta')?.classList.toggle('active', on)
  }

  function showHelp() {
    const dlg = app.querySelector('#help-dialog') as HTMLDialogElement
    if (!dlg.open) dlg.showModal()
  }

  function showTip(show: boolean) {
    const tip = app.querySelector('#tip') as HTMLElement
    tip.hidden = !show
    if (show) {
      tip.removeAttribute('hidden')
      tip.style.display = ''
    } else {
      tip.setAttribute('hidden', '')
      tip.style.display = 'none'
    }
  }

  function showFind(show: boolean) {
    const bar = app.querySelector('#find-bar') as HTMLElement
    bar.hidden = !show
    if (show) {
      bar.removeAttribute('hidden')
      bar.style.display = ''
      const input = app.querySelector('#find-query') as HTMLInputElement
      input.focus()
      input.select()
    } else {
      bar.setAttribute('hidden', '')
      bar.style.display = 'none'
    }
  }

  function getFindQuery() {
    return {
      query: (app.querySelector('#find-query') as HTMLInputElement).value,
      replace: (app.querySelector('#find-replace') as HTMLInputElement).value,
    }
  }

  function setFindCount(text: string) {
    ;(app.querySelector('#find-count') as HTMLElement).textContent = text
  }

  return {
    toolbar,
    meta,
    editorRoot,
    outline,
    help,
    updateStats,
    updateTypeHint,
    setFormatButtons,
    setTitle,
    updateOutline,
    setFocusMode,
    setOutlineOpen,
    setMetaOpen,
    showHelp,
    showTip,
    showFind,
    getFindQuery,
    setFindCount,
  }
}

function typebarButtons(): string {
  const order: ElementType[] = [
    'scene_heading',
    'action',
    'character',
    'dialogue',
    'parenthetical',
    'transition',
  ]
  return order
    .map(
      (type) =>
        `<button type="button" class="typebar__btn" data-type="${type}" aria-pressed="false">${TYPE_LABELS[type]}</button>`,
    )
    .join('')
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function bindToolbar(
  app: HTMLElement,
  handlers: ToolbarHandlers,
  initial: ScriptDocument,
): void {
  const titleInput = app.querySelector('#doc-title') as HTMLInputElement
  titleInput.value = initial.titlePage.title
  titleInput.addEventListener('input', () => handlers.onTitle(titleInput.value))

  app.querySelector('#fmt-us')!.addEventListener('click', () => handlers.onFormat('us'))
  app.querySelector('#fmt-ru')!.addEventListener('click', () => handlers.onFormat('ru'))
  app.querySelector('#btn-export')!.addEventListener('click', () => handlers.onExportFountain())
  app.querySelector('#btn-import')!.addEventListener('click', () => handlers.onImportFountain())
  app.querySelector('#btn-print')!.addEventListener('click', () => handlers.onPrint())
  app.querySelector('#btn-new')!.addEventListener('click', () => handlers.onNew())
  app.querySelector('#btn-int')!.addEventListener('click', () => handlers.onInsertInt())
  app.querySelector('#btn-ext')!.addEventListener('click', () => handlers.onInsertExt())
  app.querySelector('#btn-focus')!.addEventListener('click', () => handlers.onFocusMode())
  app.querySelector('#btn-outline')!.addEventListener('click', () => handlers.onToggleOutline())
  app.querySelector('#btn-meta')!.addEventListener('click', () => handlers.onToggleMeta())
  app.querySelector('#btn-undo')!.addEventListener('click', () => handlers.onUndo())
  app.querySelector('#btn-redo')!.addEventListener('click', () => handlers.onRedo())
  app.querySelector('#btn-help')!.addEventListener('click', () => handlers.onHelp())
  const typebar = app.querySelector('#typebar')!
  typebar.addEventListener('pointerdown', (e) => {
    const btn = (e.target as HTMLElement).closest(
      '.typebar__btn',
    ) as HTMLElement | null
    if (!btn) return
    e.preventDefault()
    const type = btn.dataset.type as ElementType | undefined
    if (type) handlers.onSetType(type)
  })
  app.querySelector('#btn-find')!.addEventListener('click', () => handlers.onFind())
  app.querySelector('#btn-rename')!.addEventListener('click', () => handlers.onRenameCharacter())
  app.querySelector('#tip-dismiss')!.addEventListener('click', (e) => {
    e.preventDefault()
    e.stopPropagation()
    localStorage.setItem('screenplay:tip-dismissed', '1')
    const tip = app.querySelector('#tip') as HTMLElement
    tip.hidden = true
    tip.setAttribute('hidden', '')
    tip.style.display = 'none'
  })

  app.querySelector('#outline-list')!.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest('.outline__item') as HTMLElement | null
    if (btn?.dataset.id) handlers.onJumpScene(btn.dataset.id)
  })

  const author = app.querySelector('#meta-author') as HTMLInputElement
  const draft = app.querySelector('#meta-draft') as HTMLInputElement
  const contact = app.querySelector('#meta-contact') as HTMLInputElement
  author.value = initial.titlePage.author
  draft.value = initial.titlePage.draftDate
  contact.value = initial.titlePage.contact
  author.addEventListener('input', () => handlers.onMeta('author', author.value))
  draft.addEventListener('input', () => handlers.onMeta('draftDate', draft.value))
  contact.addEventListener('input', () => handlers.onMeta('contact', contact.value))
}
