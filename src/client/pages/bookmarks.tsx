import { useEffect, useRef, useState } from 'react'
import { DownloadIcon, ExclamationTriangleIcon } from '@radix-ui/react-icons'
import { Button, Callout, Card, Container, Flex, Heading, Progress, Spinner, Text } from '@radix-ui/themes'
import type { RawInfoData } from '@saebasol/delphinium'
import { useSearchParams } from 'react-router'
import { type ClientBookmark, useBookmarks } from '../components/Bookmarks'
import WorkList from '../components/WorkList'
import { PAGE_SIZE } from '../utils/catalog'
import { useTypedRouteContext } from '../utils/useRouteContext'

export const getMeta = () => ({ title: 'Bookmarks | Hibiscus' })

const INFO_CONCURRENCY = 2
const INFO_MIN_INTERVAL_MS = 180
const INFO_MAX_RETRIES = 3
const EXPORT_PROGRESS_THRESHOLD = 100

function fallbackInfo(bookmark: ClientBookmark): RawInfoData {
  return {
    id: bookmark.workId,
    title: bookmark.title,
    artists: [],
    groups: [],
    type: '',
    language: null,
    series: [],
    characters: [],
    tags: [],
    date: new Date(bookmark.createdAt).toISOString(),
  }
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  if (signal?.aborted) {
    return Promise.reject(new DOMException('Aborted', 'AbortError'))
  }
  return new Promise((resolve, reject) => {
    const onAbort = () => {
      clearTimeout(timer)
      reject(new DOMException('Aborted', 'AbortError'))
    }
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort)
      resolve()
    }, ms)
    signal?.addEventListener('abort', onAbort, { once: true })
  })
}

function createRateLimiter(minIntervalMs: number) {
  let nextSlotAt = 0
  let queue: Promise<void> = Promise.resolve()

  return (signal?: AbortSignal) => {
    const wait = queue.then(async () => {
      if (signal?.aborted) {
        throw new DOMException('Aborted', 'AbortError')
      }
      const now = Date.now()
      const delay = Math.max(0, nextSlotAt - now)
      nextSlotAt = Math.max(now, nextSlotAt) + minIntervalMs
      if (delay > 0) {
        await sleep(delay, signal)
      }
    })
    queue = wait.catch(() => undefined)
    return wait
  }
}

function parseRetryAfterMs(header: string | null, attempt: number): number {
  if (header) {
    const seconds = Number(header)
    if (Number.isFinite(seconds) && seconds > 0) {
      return Math.min(Math.max(seconds * 1000, 1000), 10000)
    }
  }
  return Math.min(1000 * attempt, 10000)
}

async function fetchWorkInfoWithRetry(
  bookmark: ClientBookmark,
  waitTurn: (signal?: AbortSignal) => Promise<void>,
  signal: AbortSignal,
): Promise<RawInfoData> {
  for (let attempt = 1; attempt <= INFO_MAX_RETRIES; attempt += 1) {
    await waitTurn(signal)
    try {
      const response = await fetch(`/internal/info/${bookmark.workId}`, {
        signal,
        headers: { accept: 'application/json' },
      })
      if (response.ok) {
        return await response.json() as RawInfoData
      }
      if ((response.status === 429 || response.status >= 500) && attempt < INFO_MAX_RETRIES) {
        await sleep(parseRetryAfterMs(response.headers.get('retry-after'), attempt), signal)
        continue
      }
      break
    } catch (fetchError) {
      if (fetchError instanceof DOMException && fetchError.name === 'AbortError') {
        throw fetchError
      }
      if (attempt < INFO_MAX_RETRIES) {
        await sleep(1000 * attempt, signal)
        continue
      }
    }
  }
  return fallbackInfo(bookmark)
}

async function runWithWorkers<T>(
  items: readonly T[],
  concurrency: number,
  signal: AbortSignal,
  worker: (item: T, index: number) => Promise<void>,
): Promise<void> {
  let nextIndex = 0
  const count = Math.min(concurrency, items.length)
  const runners = Array.from({ length: count }, async () => {
    while (!signal.aborted) {
      const index = nextIndex
      nextIndex += 1
      if (index >= items.length) return
      await worker(items[index], index)
    }
  })
  await Promise.all(runners)
}

export default function BookmarksPage() {
  const { state } = useTypedRouteContext<unknown>()
  const { authEnabled, signedIn, bookmarks, error, retry } = useBookmarks()
  const [searchParams, setSearchParams] = useSearchParams()
  const [infoMap, setInfoMap] = useState<Record<number, RawInfoData>>({})
  const [loadingInfo, setLoadingInfo] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState<{ completed: number; total: number } | null>(null)
  const [exportError, setExportError] = useState<string | null>(null)
  const exportAbortRef = useRef<AbortController | null>(null)

  useEffect(() => () => exportAbortRef.current?.abort(), [])

  const totalPages = bookmarks ? Math.max(1, Math.ceil(bookmarks.length / PAGE_SIZE)) : 1
  const rawPage = Number(searchParams.get('page') ?? '1')
  const page = Number.isSafeInteger(rawPage) && rawPage >= 1 ? Math.min(rawPage, totalPages) : 1
  const pageBookmarks = bookmarks ? bookmarks.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE) : []
  const missingBookmarks = pageBookmarks.filter(bookmark => !(bookmark.workId in infoMap))
  const missingKey = missingBookmarks.map(bookmark => bookmark.workId).join(',')

  useEffect(() => {
    if (!missingKey) {
      setLoadingInfo(false)
      return
    }

    const targets = missingBookmarks
    const controller = new AbortController()
    const waitTurn = createRateLimiter(INFO_MIN_INTERVAL_MS)
    let active = true
    setLoadingInfo(true)

    runWithWorkers(targets, INFO_CONCURRENCY, controller.signal, async (bookmark) => {
      const info = await fetchWorkInfoWithRetry(bookmark, waitTurn, controller.signal)
      if (!active || controller.signal.aborted) return
      setInfoMap(current => ({
        ...current,
        [bookmark.workId]: info,
      }))
    })
      .catch(() => {
        // AbortError is expected on unmount/page change; item failures use fallbackInfo.
      })
      .finally(() => {
        if (active && !controller.signal.aborted) {
          setLoadingInfo(false)
        }
      })

    return () => {
      active = false
      controller.abort()
    }
    // missingKey uniquely identifies the uncached work IDs on the active page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [missingKey])

  const handleExport = async () => {
    if (!bookmarks || bookmarks.length === 0 || exporting) return
    const items = [...bookmarks]
    const controller = new AbortController()
    exportAbortRef.current = controller
    const showProgress = items.length >= EXPORT_PROGRESS_THRESHOLD

    setExporting(true)
    setExportError(null)
    setExportProgress(showProgress ? { completed: 0, total: items.length } : null)

    try {
      const waitTurn = createRateLimiter(INFO_MIN_INTERVAL_MS)
      const results = Array.from({ length: items.length }) as Array<ClientBookmark & { info: RawInfoData }>
      let completed = 0

      await runWithWorkers(items, INFO_CONCURRENCY, controller.signal, async (bookmark, index) => {
        const cached = infoMap[bookmark.workId]
        const info = cached ?? await fetchWorkInfoWithRetry(bookmark, waitTurn, controller.signal)
        results[index] = {
          ...bookmark,
          info,
        }

        completed += 1
        if (showProgress && !controller.signal.aborted) {
          setExportProgress({ completed, total: items.length })
        }
      })
      if (controller.signal.aborted) return

      const payload = {
        exportedAt: new Date().toISOString(),
        count: results.length,
        bookmarks: results,
      }
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `hibiscus-bookmarks-${new Date().toISOString().slice(0, 10)}.json`
      document.body.append(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    } catch (err) {
      if (!(err instanceof DOMException && err.name === 'AbortError')) {
        setExportError('Bookmarks could not be exported. Please try again.')
      }
    } finally {
      if (exportAbortRef.current === controller) {
        exportAbortRef.current = null
      }
      setExporting(false)
      setExportProgress(null)
    }
  }

  const pageItems = pageBookmarks.map(bookmark => infoMap[bookmark.workId] ?? fallbackInfo(bookmark))

  return (
    <Container size="4" px="4" py={{ initial: '5', sm: '7' }}>
      <main>
        <Flex direction="column" gap="5">
          <Flex align="center" justify="between" wrap="wrap" gap="3">
            <Heading size={{ initial: '7', sm: '8' }}>Bookmarks</Heading>
            {bookmarks && bookmarks.length > 0 && (
              <Flex align="center" gap="3" wrap="wrap">
                <Text size="2" color="gray">
                  {bookmarks.length.toLocaleString('en-US')} {bookmarks.length === 1 ? 'work' : 'works'}
                  {totalPages > 1 ? ` · Page ${page} of ${totalPages}` : ''}
                </Text>
                <Button
                  type="button"
                  size="2"
                  variant="soft"
                  color="gray"
                  disabled={exporting}
                  onClick={() => void handleExport()}
                >
                  <span style={{ display: 'inline-flex' }}>
                    {exporting ? <Spinner size="1" /> : <DownloadIcon />}
                  </span>
                  <span>Export JSON</span>
                </Button>
              </Flex>
            )}
          </Flex>

          {exporting && exportProgress && (
            <Card>
              <Flex direction="column" gap="2">
                <Flex align="center" justify="between" gap="3">
                  <Text size="2" weight="medium">
                    Exporting bookmarks ({exportProgress.completed.toLocaleString('en-US')} / {exportProgress.total.toLocaleString('en-US')})
                  </Text>
                  <Button
                    type="button"
                    size="1"
                    variant="soft"
                    color="gray"
                    onClick={() => exportAbortRef.current?.abort()}
                  >
                    Cancel
                  </Button>
                </Flex>
                <Progress value={Math.round((exportProgress.completed / exportProgress.total) * 100)} />
              </Flex>
            </Card>
          )}

          {exportError && (
            <Text size="2" color="ruby" role="alert">{exportError}</Text>
          )}

          {!signedIn && (
            <Callout.Root color="amber" variant="soft">
              <Callout.Icon>
                <ExclamationTriangleIcon />
              </Callout.Icon>
              <Flex align="center" justify="between" wrap="wrap" gap="3" style={{ width: '100%' }}>
                <Callout.Text>
                  {authEnabled
                    ? `These bookmarks are saved only in this browser and will be lost if site data is cleared. Sign in with ${state.authProviderName} to sync bookmarks with your account.`
                    : 'These bookmarks are saved only in this browser and will be lost if site data is cleared. Syncing with an OIDC account is recommended when enabled.'}
                </Callout.Text>
                {authEnabled && (
                  <Button asChild size="1" variant="solid">
                    <a href="/login?returnTo=%2Fbookmarks">Sign in</a>
                  </Button>
                )}
              </Flex>
            </Callout.Root>
          )}

          {error ? (
            <Card>
              <Flex direction="column" align="center" gap="3" py="5">
                <Text color="ruby" role="alert">{error}</Text>
                <Button variant="solid" onClick={retry}>Try again</Button>
              </Flex>
            </Card>
          ) : bookmarks === null || (loadingInfo && missingBookmarks.length > 0) ? (
            <Flex align="center" justify="center" gap="3" minHeight="40dvh">
              <Spinner size="3" /><Text color="gray">Loading bookmarks...</Text>
            </Flex>
          ) : bookmarks.length === 0 ? (
            <Message title="No bookmarks yet" description="Use the Bookmark button on any work to add it here." contained />
          ) : (
            <WorkList
              items={pageItems}
              count={bookmarks.length}
              currentPage={page}
              onPageChange={next => setSearchParams(next > 1 ? { page: String(next) } : {})}
              navLabel="Bookmark pages"
            />
          )}
        </Flex>
      </main>
    </Container>
  )
}

function Message({ title, description, children, contained = false }: {
  title: string
  description: string
  children?: React.ReactNode
  contained?: boolean
}) {
  const content = (
    <Flex direction="column" align="center" justify="center" gap="4" minHeight={contained ? '16rem' : '60dvh'}>
      <Heading size="6" align="center">{title}</Heading>
      <Text color="gray" align="center">{description}</Text>
      {children}
    </Flex>
  )
  return contained ? <Card>{content}</Card> : <Container size="1" px="4"><main>{content}</main></Container>
}
