import { Button, Card, Container, Flex, Heading, Link, Spinner, Text } from '@radix-ui/themes'
import { BookmarkIcon } from '@radix-ui/react-icons'
import { BookmarkButton, useBookmarks } from '../components/Bookmarks'

export const getMeta = () => ({ title: 'Bookmarks | Hibiscus' })

export default function BookmarksPage() {
  const { authEnabled, signedIn, bookmarks, error, retry } = useBookmarks()

  if (!authEnabled) {
    return <Message title="Bookmarks are unavailable" description="No OIDC identity provider is configured on this server." />
  }

  if (!signedIn) {
    return (
      <Message title="Your reading list, kept in one place" description="Sign in to save and revisit your bookmarks." >
        <Button asChild size="3" variant="solid"><a href="/login?returnTo=%2Fbookmarks">Log in</a></Button>
      </Message>
    )
  }

  return (
    <Container size="3" px="4" py={{ initial: '5', sm: '7' }}>
      <main>
        <Flex direction="column" gap="4">
          <Flex align="center" gap="3">
            <BookmarkIcon width="1.5rem" height="1.5rem" />
            <Heading size="7">Bookmarks</Heading>
          </Flex>

          {error ? (
            <Card>
              <Flex direction="column" align="center" gap="3" py="5">
                <Text color="ruby" role="alert">{error}</Text>
                <Button variant="solid" onClick={retry}>Try again</Button>
              </Flex>
            </Card>
          ) : bookmarks === null ? (
            <Flex align="center" justify="center" gap="3" minHeight="40dvh">
              <Spinner size="3" /><Text color="gray">Loading bookmarks...</Text>
            </Flex>
          ) : bookmarks.length === 0 ? (
            <Message title="No bookmarks yet" description="Use the Bookmark button on any work to add it here." contained />
          ) : (
            <Flex direction="column" gap="3">
              {bookmarks.map(bookmark => (
                <Card key={bookmark.workId} size="3">
                  <Flex justify="between" align="center" gap="4">
                    <Flex direction="column" gap="1" style={{ minWidth: 0 }}>
                      <Link href={'/viewer/' + bookmark.workId} weight="bold" size="4">{bookmark.title}</Link>
                      <Text size="1" color="gray">Work {bookmark.workId} · Added {new Date(bookmark.createdAt).toLocaleDateString()}</Text>
                    </Flex>
                    <BookmarkButton workId={bookmark.workId} title={bookmark.title} />
                  </Flex>
                </Card>
              ))}
            </Flex>
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
