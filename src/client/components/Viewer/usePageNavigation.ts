import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { previousPage, savePage } from './progress'
import type { ReadingDirection } from './types'

function hashPage() {
  const value = window.location.hash.slice(1)
  return /^[1-9]\d*$/.test(value) ? Number(value) : undefined
}

function alignPage(track: HTMLDivElement, page: number, webtoon: boolean) {
  if (webtoon) {
    track.scrollTop = (track.children[page - 1] as HTMLElement).offsetTop
  } else {
    track.scrollLeft = (track.dir === 'rtl' ? -1 : 1) * (page - 1) * track.clientWidth
  }
}

function webtoonPage(track: HTMLDivElement) {
  // Find the last page whose top has crossed the top of the viewport.
  let first = 0
  let last = track.children.length - 1
  while (first < last) {
    const middle = Math.ceil((first + last) / 2)
    if ((track.children[middle] as HTMLElement).offsetTop <= track.scrollTop + 1) first = middle
    else last = middle - 1
  }
  return first + 1
}

export function usePageNavigation(mangaId: string, total: number, direction: ReadingDirection, overview: boolean, webtoon: boolean) {
  const track = useRef<HTMLDivElement>(null)
  const position = useRef(1)
  const trackWidth = useRef(0)
  const [page, setPage] = useState<number | null>(null)

  const recordPage = useCallback((next: number) => {
    position.current = next
    setPage(next)
    const hash = '#' + next
    if (window.location.hash !== hash) window.history.replaceState(window.history.state, '', hash)
    savePage(mangaId, next)
  }, [mangaId])

  const goTo = useCallback((target: number) => {
    const node = track.current
    if (!node || !Number.isFinite(target) || !total) return
    const next = Math.max(1, Math.min(target, total))
    alignPage(node, next, webtoon)
    recordPage(next)
  }, [recordPage, total, webtoon])

  useLayoutEffect(() => {
    const restoreHash = () => goTo(hashPage() ?? 1)
    if (window.location.hash) restoreHash()
    else goTo(previousPage(mangaId))
    window.addEventListener('hashchange', restoreHash)
    return () => window.removeEventListener('hashchange', restoreHash)
  }, [mangaId, goTo])

  useLayoutEffect(() => {
    const node = track.current
    if (!node) return
    trackWidth.current = node.clientWidth
    alignPage(node, position.current, webtoon)
    const observer = new ResizeObserver(() => {
      if (trackWidth.current !== node.clientWidth) {
        trackWidth.current = node.clientWidth
        alignPage(node, position.current, webtoon)
      }
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [direction, webtoon])

  useEffect(() => {
    const step = direction === 'rtl' ? -1 : 1
    function handleKey(event: KeyboardEvent) {
      if (overview || event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return
      if (event.target instanceof Element && event.target.closest('input, textarea, [contenteditable=true], [role=slider], [role=combobox], [role=listbox]')) return
      const targets: Record<string, number> = {
        ArrowLeft: position.current - step, ArrowRight: position.current + step, Home: 1, End: total,
      }
      if (!Object.hasOwn(targets, event.key)) return
      event.preventDefault()
      goTo(targets[event.key])
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [goTo, direction, total, overview])

  function syncScroll(node: HTMLDivElement) {
    if (!node.clientWidth || node.clientWidth !== trackWidth.current) return
    const next = webtoon ? webtoonPage(node) : Math.min(total, 1 + Math.round(Math.abs(node.scrollLeft) / node.clientWidth))
    if (next !== position.current) recordPage(next)
  }

  function moveBy(pages: number) {
    goTo(position.current + pages)
  }

  return { track, page, goTo, moveBy, syncScroll }
}
