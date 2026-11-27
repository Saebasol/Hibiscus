export function previousPage(mangaId: string): number {
  try {
    const page = Number(localStorage.getItem('hibiscus.page.' + mangaId))
    if (Number.isSafeInteger(page) && page > 0) return page
  } catch { /* Storage can be unavailable in private browsing. */ }
  return 1
}

export function savePage(mangaId: string, page: number) {
  try { localStorage.setItem('hibiscus.page.' + mangaId, String(page)) } catch { /* URL still tracks the page. */ }
}
