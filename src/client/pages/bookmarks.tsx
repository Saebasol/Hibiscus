import { useEffect, useState } from 'react'
import { Button, Card, Container, Flex, Heading, Spinner, Text } from '@radix-ui/themes'
import { BookmarkIcon } from '@radix-ui/react-icons'
import type { RawInfoData } from '@saebasol/delphinium'
import { useSearchParams } from 'react-router'
import { type ClientBookmark, useBookmarks } from '../components/Bookmarks'
import WorkList from '../components/WorkList'
import { PAGE_SIZE } from '../utils/catalog'

export const getMeta = () => ({ title: 'Bookmarks | Hibiscus' })

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

export default function BookmarksPage() {
  const { authEnabled, signedIn, bookmarks, error, retry } = useBookmarks()
  const [searchParams, setSearchParams] = useSearchParams()
  const [infoMap, setInfoMap] = useState<Record<number, RawInfoData>>({})
  const [loadingInfo, setLoadingInfo] = useState(false)

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
    let active = true
    setLoadingInfo(true)

    Promise.all(
      targets.map(async (bookmark): Promise<[number, RawInfoData]> => {
        try {
          const response = await fetch(`/internal/info/${bookmark.workId}`, {
            signal: controller.signal,
            headers: { accept: 'application/json' },
          })
          if (!response.ok) throw new Error('Failed to load work info')
          const info = await response.json() as RawInfoData
          return [bookmark.workId, info]
        } catch {
          return [bookmark.workId, fallbackInfo(bookmark)]
        }
      }),
    ).then(entries => {
      if (!active || controller.signal.aborted) return
      setInfoMap(current => {
        const next = { ...current }
        for (const [id, info] of entries) {
          next[id] = info
        }
        return next
      })
      setLoadingInfo(false)
    })

    return () => {
      active = false
      controller.abort()
    }
    // missingKey uniquely identifies the uncached work IDs on the active page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [missingKey])

  if (!authEnabled) {
    return <Message title="Bookmarks are unavailable" description="No OIDC identity provider is configured on this server." />
  }

  if (!signedIn) {
    return (
      <Message title="Your reading list, kept in one place" description="Sign in to save and revisit your bookmarks.">
        <Button asChild size="3" variant="solid"><a href="/login?returnTo=%2Fbookmarks">Log in</a></Button>
      </Message>
    )
  }

  const pageItems = pageBookmarks.map(bookmark => infoMap[bookmark.workId] ?? fallbackInfo(bookmark))

  return (
    <Container size="4" px="4" py={{ initial: '5', sm: '7' }}>
      <main>
        <Flex direction="column" gap="5">
          <Flex align="baseline" justify="between" wrap="wrap" gap="2">
            <Flex align="center" gap="3">
              <BookmarkIcon width="1.5rem" height="1.5rem" />
              <Heading size={{ initial: '7', sm: '8' }}>Bookmarks</Heading>
            </Flex>
            {bookmarks && bookmarks.length > 0 && (
              <Text size="2" color="gray">
                {bookmarks.length.toLocaleString('en-US')} {bookmarks.length === 1 ? 'work' : 'works'}
                {totalPages > 1 ? ` · Page ${page} of ${totalPages}` : ''}
              </Text>
            )}
          </Flex>

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
