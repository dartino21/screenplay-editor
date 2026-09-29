/**
 * Measure pixel rects of a [start, end) range inside a textarea,
 * relative to `relativeTo` (typically the line-wrap).
 */
export function getTextareaRangeRects(
  textarea: HTMLTextAreaElement,
  start: number,
  end: number,
  relativeTo: HTMLElement,
): { left: number; top: number; width: number; height: number }[] {
  const style = window.getComputedStyle(textarea)
  const mirror = document.createElement('div')
  mirror.setAttribute('aria-hidden', 'true')

  const copyProps = [
    'box-sizing',
    'border-top-width',
    'border-right-width',
    'border-bottom-width',
    'border-left-width',
    'padding-top',
    'padding-right',
    'padding-bottom',
    'padding-left',
    'font-style',
    'font-variant',
    'font-weight',
    'font-stretch',
    'font-size',
    'line-height',
    'font-family',
    'text-align',
    'text-transform',
    'text-indent',
    'letter-spacing',
    'word-spacing',
    'tab-size',
    'white-space',
    'word-wrap',
    'overflow-wrap',
    'word-break',
  ]

  for (const prop of copyProps) {
    mirror.style.setProperty(prop, style.getPropertyValue(prop))
  }

  // Sit exactly where the textarea sits inside the wrap
  mirror.style.position = 'absolute'
  mirror.style.left = `${textarea.offsetLeft}px`
  mirror.style.top = `${textarea.offsetTop}px`
  mirror.style.width = `${textarea.clientWidth}px`
  mirror.style.height = 'auto'
  mirror.style.margin = '0'
  mirror.style.overflow = 'hidden'
  mirror.style.visibility = 'hidden'
  mirror.style.pointerEvents = 'none'
  mirror.style.whiteSpace = 'pre-wrap'
  mirror.style.wordWrap = 'break-word'
  mirror.style.zIndex = '-1'

  const text = textarea.value
  const before = document.createTextNode(text.slice(0, start))
  const mark = document.createElement('span')
  mark.textContent = text.slice(start, end) || '\u200b'
  const after = document.createTextNode(text.slice(end))

  mirror.appendChild(before)
  mirror.appendChild(mark)
  mirror.appendChild(after)
  relativeTo.appendChild(mirror)

  mirror.scrollTop = textarea.scrollTop
  mirror.scrollLeft = textarea.scrollLeft

  const rel = relativeTo.getBoundingClientRect()
  const results = [...mark.getClientRects()].map((r) => ({
    left: r.left - rel.left + relativeTo.scrollLeft,
    top: r.top - rel.top + relativeTo.scrollTop,
    width: Math.max(r.width, 2),
    height: Math.max(r.height, 10),
  }))

  mirror.remove()
  return results
}
