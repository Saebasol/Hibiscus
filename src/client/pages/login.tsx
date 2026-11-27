import { Avatar, Button, Card, Container, Flex, Heading, Text } from '@radix-ui/themes'
import { Link, useSearchParams } from 'react-router'
import { useTypedRouteContext } from '../utils/useRouteContext'

function returnPath(value: string | null) {
  return value?.startsWith('/') && !value.startsWith('//') && !value.includes('\\') ? value : '/list/1'
}

export const getMeta = () => ({ title: 'Account | Hibiscus' })

export default function LoginPage() {
  const { state } = useTypedRouteContext<unknown>()
  const [searchParams] = useSearchParams()
  const returnTo = returnPath(searchParams.get('returnTo'))
  const error = searchParams.get('error')
  const user = state.currentUser

  return (
    <Container size="1" px="4" py={{ initial: '6', sm: '9' }}>
      <main>
        <Card size="4">
          <Flex direction="column" align="center" gap="4">
            {user && <Avatar src={user.avatarUrl ?? undefined} fallback={user.displayName.slice(0, 1).toUpperCase()} size="5" />}
            <Heading size="6" align="center">{user ? `Welcome, ${user.displayName}` : 'Sign in to Hibiscus'}</Heading>
            <Text color="gray" align="center" size="3">
              {!state.authEnabled
                ? 'No OIDC identity provider is configured on this server.'
                : user
                  ? 'Your identity is connected. Bookmarks are saved to your account on this server.'
                  : `Use ${state.authProviderName} to sign in. Hibiscus never sees your password.`}
            </Text>

            {error && (
              <Text color="ruby" align="center" role="alert">
                {error === 'invalid_request'
                  ? 'This sign-in request expired or was already used. Please try again.'
                  : 'The identity provider could not complete sign-in. Please try again.'}
              </Text>
            )}

            {user ? (
              <Flex gap="3" wrap="wrap" justify="center">
                <Button asChild variant="solid"><Link to={returnTo}>Continue browsing</Link></Button>
                <form method="post" action="/auth/logout">
                  <Button type="submit" variant="solid" color="gray">Log out</Button>
                </form>
              </Flex>
            ) : state.authEnabled ? (
              <Button asChild size="3" variant="solid">
                <a href={'/auth/login?returnTo=' + encodeURIComponent(returnTo)}>Continue with {state.authProviderName}</a>
              </Button>
            ) : (
              <Button asChild variant="solid"><Link to="/list/1">Back to library</Link></Button>
            )}
          </Flex>
        </Card>
      </main>
    </Container>
  )
}
