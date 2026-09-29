import '@fontsource/source-sans-3/400.css'
import '@fontsource/source-sans-3/500.css'
import '@fontsource/source-sans-3/600.css'
import './styles/base.css'
import './styles/screenplay.css'

import { collectCharacters } from './editor/autocomplete'
import { findInDocument } from './editor/find'
import { ScriptEditor } from './editor/editor'
import { HistoryStack } from './editor/history'
import { parseFountain, serializeFountain } from './model/fountain'
import { emptyDocument, type ScriptDocument } from './model/types'
import {
  loadOrSeedDocument,
  saveDocument,
  listScripts,
  getCurrentScriptId,
  createScript,
  saveScriptAs,
  openScript,
  deleteScript,
  duplicateScript,
  renameScript,
} from './storage'
import { bindToolbar, renderShell } from './ui/toolbar'

const SAMPLE: ScriptDocument = {
  ...emptyDocument(),
  titlePage: {
    title: 'Пример',
    author: '',
    draftDate: '',
    contact: '',
  },
  elements: [
    {
      id: crypto.randomUUID(),
      type: 'scene_heading',
      text: 'INT. КОФЕЙНЯ — DAY',
    },
    {
      id: crypto.randomUUID(),
      type: 'action',
      text: 'Утренний свет. За стойкой работает АННА. Входит ИВАН.',
    },
    {
      id: crypto.randomUUID(),
      type: 'character',
      text: 'ИВАН',
    },
    {
      id: crypto.randomUUID(),
      type: 'parenthetical',
      text: '(устало)',
    },
    {
      id: crypto.randomUUID(),
      type: 'dialogue',
      text: 'Обычный?',
    },
    {
      id: crypto.randomUUID(),
      type: 'character',
      text: 'АННА',
    },
    {
      id: crypto.randomUUID(),
      type: 'dialogue',
      text: 'Как всегда.',
    },
  ],
  format: 'us',
}

function downloadFountain(doc: ScriptDocument) {
  const text = serializeFountain(doc)
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const name = (doc.titlePage.title || 'screenplay')
    .replace(/[^\wа-яА-ЯёЁ\-]+/g, '_')
    .slice(0, 60)
  a.href = url
  a.download = `${name}.fountain`
  a.click()
  URL.revokeObjectURL(url)
}

function main() {
  const app = document.querySelector('#app')
  if (!app) return

  let doc = loadOrSeedDocument(SAMPLE)

  const shell = renderShell(app as HTMLElement)
  const history = new HistoryStack(doc)
  let saveTimer: number | undefined
  let focusMode = false
  let outlineOpen = true
  let metaOpen = false
  let findOpen = false
  let findMatches: ReturnType<typeof findInDocument> = []
  let findIndex = 0

  shell.setOutlineOpen(outlineOpen)
  shell.setMetaOpen(metaOpen)
  shell.showTip(!localStorage.getItem('screenplay:tip-dismissed'))

  let liveDoc = (): ScriptDocument => doc
  const editor = new ScriptEditor(shell.editorRoot, doc, {
    onBeforeMutate: () => history.push(liveDoc()),
    onChange: (next) => {
      doc = next
      shell.updateStats(doc)
      shell.setTitle(doc.titlePage.title)
      shell.updateOutline(doc, editor.getFocusIndex())
      if (findOpen) refreshFind(false)
      window.clearTimeout(saveTimer)
      saveTimer = window.setTimeout(() => {
        saveDocument(doc)
        shell.setSaveStatus('Сохранено')
      }, 300)
    },
    onFocusType: (type) => shell.updateTypeHint(type),
    onFocusIndex: (index) => shell.updateOutline(doc, index),
  })
  liveDoc = () => editor.getDocument()

  function refreshFind(jump: boolean, focusEditor = false) {
    const { query } = shell.getFindQuery()
    findMatches = findInDocument(editor.getDocument(), query)
    if (findIndex >= findMatches.length) findIndex = Math.max(0, findMatches.length - 1)
    shell.setFindCount(
      findMatches.length
        ? `${findIndex + 1} / ${findMatches.length}`
        : query
          ? '0'
          : '',
    )
    const m = findMatches[findIndex]
    if (!query || !m) {
      editor.clearFindHighlight()
      return
    }

    if (jump) {
      editor.jumpToMatch(m.elementId, m.start, m.end, {
        focus: focusEditor,
      })
      if (!focusEditor) {
        requestAnimationFrame(() => {
          const input = document.querySelector('#find-query') as HTMLInputElement
          if (document.activeElement !== input) {
            const pos = input.selectionStart ?? input.value.length
            input.focus()
            input.setSelectionRange(pos, pos)
          }
        })
      }
    } else {
      // Live highlight while typing in the find field — no focus steal
      editor.setFindHighlight(m.elementId, m.start, m.end)
    }
  }

  function openFind() {
    findOpen = true
    shell.showFind(true)
    refreshFind(false)
  }

  function closeFind() {
    findOpen = false
    shell.showFind(false)
    shell.setFindCount('')
    editor.clearFindHighlight()
  }

  function renameCharacterFlow() {
    const names = collectCharacters(editor.getDocument().elements)
    const from =
      prompt(
        names.length
          ? `Кого переименовать?\n(${names.slice(0, 12).join(', ')})`
          : 'Имя персонажа:',
        names[0] ?? '',
      )?.trim() ?? ''
    if (!from) return
    const to = prompt(`Новое имя для «${from}»:`, from)?.trim() ?? ''
    if (!to || to === from) return
    const n = editor.renameCharacter(from, to)
    doc = editor.getDocument()
    alert(n ? `Обновлено реплик: ${n}` : 'Персонаж не найден')
  }

  function refreshLibraryDialog() {
    const currentId = getCurrentScriptId()
    shell.showLibrary(
      listScripts().map((s) => ({
        ...s,
        current: s.id === currentId,
      })),
      {
        onOpen: (id) => {
          if (id === getCurrentScriptId()) return
          saveDocument(editor.getDocument())
          const next = openScript(id)
          if (!next) return
          history.push(editor.getDocument())
          applyDoc(next)
          shell.setSaveStatus('Открыто')
        },
        onDelete: (id) => {
          const meta = listScripts().find((s) => s.id === id)
          if (
            !confirm(
              `Удалить «${meta?.title ?? 'сценарий'}»? Это действие только в вашем браузере.`,
            )
          ) {
            return
          }
          const wasCurrent = id === getCurrentScriptId()
          if (!wasCurrent) {
            saveDocument(editor.getDocument())
          }
          const next = deleteScript(id)
          if (wasCurrent && next) {
            history.sync(next)
            applyDoc(next)
          }
          refreshLibraryDialog()
        },
        onDuplicate: (id) => {
          saveDocument(editor.getDocument())
          const newId = duplicateScript(id)
          if (!newId) return
          const next = openScript(newId)
          if (next) {
            history.sync(next)
            applyDoc(next)
          }
          refreshLibraryDialog()
          shell.setSaveStatus('Копия')
        },
        onRename: (id) => {
          const meta = listScripts().find((s) => s.id === id)
          const title =
            prompt('Название сценария:', meta?.title ?? '')?.trim() ?? ''
          if (!title) return
          renameScript(id, title)
          if (id === getCurrentScriptId()) {
            editor.updateTitlePage({ title })
            doc = editor.getDocument()
            shell.setTitle(title)
            saveDocument(doc)
          }
          refreshLibraryDialog()
        },
      },
    )
  }

  function saveAsFlow() {
    saveDocument(editor.getDocument())
    const current = editor.getDocument()
    const title =
      prompt(
        'Сохранить копию как…',
        current.titlePage.title || 'Без названия',
      )?.trim() ?? ''
    if (!title) return
    const id = saveScriptAs(current, title)
    const next = openScript(id)
    if (next) {
      history.sync(next)
      applyDoc(next)
    }
    shell.setSaveStatus('Копия сохранена')
  }

  function applyDoc(next: ScriptDocument) {
    doc = next
    editor.setDocument(doc)
    history.sync(doc)
    saveDocument(doc)
    shell.setTitle(doc.titlePage.title)
    shell.setFormatButtons(doc.format)
    shell.updateStats(doc)
    shell.updateOutline(doc, editor.getFocusIndex())
    ;(document.querySelector('#meta-author') as HTMLInputElement).value =
      doc.titlePage.author
    ;(document.querySelector('#meta-draft') as HTMLInputElement).value =
      doc.titlePage.draftDate
    ;(document.querySelector('#meta-contact') as HTMLInputElement).value =
      doc.titlePage.contact
  }

  function undo() {
    const prev = history.undo(editor.getDocument())
    if (prev) applyDoc(prev)
  }

  function redo() {
    const next = history.redo(editor.getDocument())
    if (next) applyDoc(next)
  }

  function importFountain() {
    const input = document.querySelector('#file-import') as HTMLInputElement
    input.value = ''
    input.click()
    input.onchange = () => {
      const file = input.files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = () => {
        const text = String(reader.result ?? '')
        history.push(editor.getDocument())
        const parsed = parseFountain(text)
        parsed.format = doc.format
        applyDoc(parsed)
      }
      reader.readAsText(file)
    }
  }

  bindToolbar(
    app as HTMLElement,
    {
      onFormat: (format) => {
        editor.setFormat(format)
        doc = editor.getDocument()
        shell.setFormatButtons(format)
        shell.updateStats(doc)
      },
      onTitle: (title) => {
        editor.updateTitlePage({ title })
        doc = editor.getDocument()
      },
      onMeta: (field, value) => {
        editor.updateTitlePage({ [field]: value })
        doc = editor.getDocument()
      },
      onExportFountain: () => downloadFountain(editor.getDocument()),
      onImportFountain: () => importFountain(),
      onPrint: () => {
        let style = document.getElementById('print-page-size')
        if (!style) {
          style = document.createElement('style')
          style.id = 'print-page-size'
          document.head.appendChild(style)
        }
        const size = editor.getDocument().format === 'ru' ? 'A4' : 'letter'
        style.textContent = `@media print { @page { size: ${size}; margin: 0; } }`
        window.print()
      },
      onNew: () => {
        if (!confirm('Создать новый сценарий? Текущий останется в «Мои».')) return
        const prev = editor.getDocument()
        saveDocument(prev)
        history.push(prev)
        const fresh = emptyDocument()
        createScript(fresh)
        applyDoc(fresh)
        shell.setSaveStatus('Новый')
      },
      onOpenLibrary: () => {
        saveDocument(editor.getDocument())
        refreshLibraryDialog()
      },
      onSaveAs: () => saveAsFlow(),
      onInsertInt: () => editor.insertSlugline('int'),
      onInsertExt: () => editor.insertSlugline('ext'),
      onFocusMode: () => {
        focusMode = !focusMode
        shell.setFocusMode(focusMode)
      },
      onToggleOutline: () => {
        outlineOpen = !outlineOpen
        shell.setOutlineOpen(outlineOpen)
      },
      onToggleMeta: () => {
        metaOpen = !metaOpen
        shell.setMetaOpen(metaOpen)
      },
      onUndo: () => undo(),
      onRedo: () => redo(),
      onHelp: () => shell.showHelp(),
      onJumpScene: (id) => editor.jumpToElement(id),
      onFind: () => openFind(),
      onRenameCharacter: () => renameCharacterFlow(),
      onSetType: (type) => editor.setFocusedLineType(type),
    },
    doc,
  )

  // Find bar controls
  const findQuery = document.querySelector('#find-query') as HTMLInputElement
  const findReplace = document.querySelector('#find-replace') as HTMLInputElement
  findQuery.addEventListener('input', () => {
    findIndex = 0
    refreshFind(false)
  })
  findQuery.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (e.shiftKey) {
        findIndex = (findIndex - 1 + findMatches.length) % Math.max(1, findMatches.length)
      } else {
        findIndex = (findIndex + 1) % Math.max(1, findMatches.length)
      }
      refreshFind(true, false)
    }
    if (e.key === 'Escape') closeFind()
  })
  findReplace.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeFind()
  })
  document.querySelector('#find-next')!.addEventListener('click', () => {
    findIndex = (findIndex + 1) % Math.max(1, findMatches.length)
    refreshFind(true, false)
  })
  document.querySelector('#find-prev')!.addEventListener('click', () => {
    findIndex = (findIndex - 1 + findMatches.length) % Math.max(1, findMatches.length)
    refreshFind(true, false)
  })
  document.querySelector('#find-do-replace')!.addEventListener('click', () => {
    const { query, replace } = shell.getFindQuery()
    const m = findMatches[findIndex]
    if (!m || !query) return
    editor.replaceOne(m.elementId, m.start, m.end, replace)
    doc = editor.getDocument()
    refreshFind(true, false)
    requestAnimationFrame(() => {
      ;(document.querySelector('#find-query') as HTMLInputElement).focus()
    })
  })
  document.querySelector('#find-do-all')!.addEventListener('click', () => {
    const { query, replace } = shell.getFindQuery()
    const n = editor.replaceAllCounted(query, replace)
    doc = editor.getDocument()
    findIndex = 0
    refreshFind(false)
    shell.setFindCount(n ? `заменено ${n}` : '0')
    requestAnimationFrame(() => {
      ;(document.querySelector('#find-query') as HTMLInputElement).focus()
    })
  })
  document.querySelector('#find-close')!.addEventListener('click', () => closeFind())

  // Global shortcuts when not typing in title/meta
  document.addEventListener('keydown', (e) => {
    if (e.key === 'F1') {
      e.preventDefault()
      shell.showHelp()
      return
    }

    const t = e.target as HTMLElement
    const inField =
      t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable

    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'f') {
      e.preventDefault()
      openFind()
      return
    }

    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
      e.preventDefault()
      saveAsFlow()
      return
    }

    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'o') {
      e.preventDefault()
      saveDocument(editor.getDocument())
      refreshLibraryDialog()
      return
    }

    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
      e.preventDefault()
      if (e.shiftKey) redo()
      else undo()
      return
    }

    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y') {
      e.preventDefault()
      redo()
      return
    }

    if (inField && t.tagName === 'TEXTAREA') {
      // F and \ still work from editor
    } else if (inField) {
      return
    }

    if (e.key === 'f' || e.key === 'F' || e.key === 'а' || e.key === 'А') {
      if (!e.metaKey && !e.ctrlKey && !e.altKey) {
        // Only when not in textarea — for textarea use toolbar
        if (t.tagName !== 'TEXTAREA') {
          e.preventDefault()
          focusMode = !focusMode
          shell.setFocusMode(focusMode)
        }
      }
    }

    if (e.key === '\\' || e.key === 'ё') {
      if (!e.metaKey && !e.ctrlKey) {
        e.preventDefault()
        outlineOpen = !outlineOpen
        shell.setOutlineOpen(outlineOpen)
      }
    }

    if (e.key === 'Escape' && focusMode) {
      focusMode = false
      shell.setFocusMode(false)
    }
  })

  // F key from within editor (focus mode)
  shell.editorRoot.addEventListener('keydown', (e) => {
    if ((e.key === 'f' || e.key === 'F') && e.altKey) {
      e.preventDefault()
      focusMode = !focusMode
      shell.setFocusMode(focusMode)
    }
  })

  shell.setFormatButtons(doc.format)
  shell.setTitle(doc.titlePage.title)
  shell.updateStats(doc)
  editor.render()
  shell.updateOutline(doc, 0)
}

main()
