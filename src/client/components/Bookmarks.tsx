import { createContext, useContext, useEffect, useState } from 'react'
import { BookmarkIcon } from '@radix-ui/react-icons'
import { Button, Card, Flex, IconButton, Text } from '@radix-ui/themes'
import { useTypedRouteContext } from '../utils/useRouteContext'

const LOCAL_BOOKMARKS_KEY = 'hibiscus.bookmarks'

export interface ClientBookmark {
  workId: number
  title: string
  createdAt: number
}

interface BookmarksContextValue {
  authEnabled: boolean
  signedIn: boolean
  bookmarks: ClientBookmark[] | null
  pendingIds: Set<number>
  error: string | null
  retry: () => void
  isBookmarked: (workId: number) => boolean
  toggleBookmark: (workId: number, title: string) => Promise<void>
}

const BookmarksContext = createContext<BookmarksContextValue | null>(null)

function loginUrl(returnTo = '/list/1') {
  return '/login?returnTo=' + encodeURIComponent(returnTo)
}

function readLocalBookmarks(): ClientBookmark[] {
  if (typeof localStorage === 'undefined') return []
  try {
    const raw = localStorage.getItem(LOCAL_BOOKMARKS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (item): item is ClientBookmark =>
        Boolean(item)
        && typeof item.workId === 'number'
        && Number.isSafeInteger(item.workId)
        && typeof item.title === 'string'
        && typeof item.createdAt === 'number',
    )
  } catch {
    return []
  }
}

function writeLocalBookmarks(bookmarks: ClientBookmark[]) {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(LOCAL_BOOKMARKS_KEY, JSON.stringify(bookmarks))
  } catch {
    // Storage is optional.
  }
}

export function BookmarksProvider({ children }: { children: React.ReactNode }) {
  const { state } = useTypedRouteContext<unknown>()
  const userId = state.currentUser?.id
  const [bookmarks, setBookmarks] = useState<ClientBookmark[] | null>(null)
  const [pendingIds, setPendingIds] = useState<Set<number>>(new Set())
  const [error, setError] = useState<string | null>(null)
  const [mutationError, setMutationError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    if (!userId) {
      setBookmarks(readLocalBookmarks())
      setError(null)
      setMutationError(null)
      return
    }

    let active = true
    setBookmarks(null)
    setError(null)
    setMutationError(null)
    fetch('/internal/bookmarks', { headers: { accept: 'application/json' } })
      .then(async response => {
        if (response.status === 401) {
          if (active) window.location.assign(loginUrl(window.location.pathname + window.location.search))
          return
        }
        if (!response.ok) throw new Error('Failed to load bookmarks')
        const payload = await response.json() as { bookmarks: ClientBookmark[] }
        if (active) setBookmarks(payload.bookmarks)
      })
      .catch(() => {
        if (active) setError('Bookmarks could not be loaded. Please try again.')
      })
    return () => { active = false }
  }, [userId, attempt])

  const toggleBookmark = async (workId: number, title: string) => {
    if (pendingIds.has(workId)) return
    setMutationError(null)
    const bookmarked = bookmarks?.some(bookmark => bookmark.workId === workId) === true

    if (!userId) {
      const base = bookmarks ?? readLocalBookmarks()
      const updated = bookmarked
        ? base.filter(bookmark => bookmark.workId !== workId)
        : [{ workId, title, createdAt: Date.now() }, ...base.filter(bookmark => bookmark.workId !== workId)]
      setBookmarks(updated)
      writeLocalBookmarks(updated)
      return
    }

    setPendingIds(current => new Set(current).add(workId))

    try {
      const response = await fetch('/internal/bookmarks/' + workId, bookmarked
        ? { method: 'DELETE' }
        : { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ title }) })
      if (response.status === 401) {
        window.location.assign(loginUrl(window.location.pathname + window.location.search))
        return
      }
      if (!response.ok) throw new Error('Failed to update bookmark')
      setBookmarks(current => current && (bookmarked
        ? current.filter(bookmark => bookmark.workId !== workId)
        : [{ workId, title, createdAt: Date.now() }, ...current.filter(bookmark => bookmark.workId !== workId)]))
    } catch {
      setMutationError('The bookmark could not be updated. Please try again.')
    } finally {
      setPendingIds(current => {
        const next = new Set(current)
        next.delete(workId)
        return next
      })
    }
  }

  return (
    <BookmarksContext.Provider value={{
      authEnabled: state.authEnabled,
      signedIn: Boolean(state.currentUser),
      bookmarks,
      pendingIds,
      error,
      retry: () => setAttempt(current => current + 1),
      isBookmarked: workId => bookmarks?.some(bookmark => bookmark.workId === workId) === true,
      toggleBookmark,
    }}>
      {children}
      {mutationError && (
        <Card
          role="alert"
          size="2"
          style={{
            position: 'fixed',
            right: '1rem',
            bottom: '1rem',
            zIndex: 1100,
            maxWidth: '22rem',
          }}
        >
          <Flex align="center" justify="between" gap="3">
            <Text size="2" color="ruby">{mutationError}</Text>
            <Button type="button" size="1" variant="soft" color="gray" onClick={() => setMutationError(null)}>
              Dismiss
            </Button>
          </Flex>
        </Card>
      )}
    </BookmarksContext.Provider>
  )
}

export function useBookmarks() {
  const context = useContext(BookmarksContext)
  if (!context) throw new Error('useBookmarks must be used inside BookmarksProvider')
  return context
}

export function BookmarkButton({ workId, title, compact = false }: { workId: number; title: string; compact?: boolean }) {
  const bookmarks = useBookmarks()
  const bookmarked = bookmarks.isBookmarked(workId)
  const label = bookmarked ? 'Remove bookmark' : 'Add bookmark'
  const disabled = bookmarks.bookmarks === null || bookmarks.pendingIds.has(workId)
  return compact ? (
    <IconButton type="button" size="1" variant="solid" color={bookmarked ? 'ruby' : 'gray'}
      aria-label={label} title={label} aria-pressed={bookmarked} disabled={disabled}
      onClick={() => void bookmarks.toggleBookmark(workId, title)}>
      <BookmarkIcon />
    </IconButton>
  ) : (
    <Button type="button" size="1" variant="solid" color={bookmarked ? 'ruby' : 'gray'}
      style={{ flexShrink: 0 }} aria-pressed={bookmarked} disabled={disabled}
      onClick={() => void bookmarks.toggleBookmark(workId, title)}>
      <BookmarkIcon />
      <span key={bookmarked ? 'bookmarked' : 'bookmark'}>
        {bookmarked ? 'Bookmarked' : 'Bookmark'}
      </span>
    </Button>
  )
}
