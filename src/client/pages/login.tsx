import { useRef } from 'react'
import { AlertDialog, Avatar, Button, Card, Container, Flex, Heading, Separator, Text } from '@radix-ui/themes'
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
  const notice = searchParams.get('notice')
  const user = state.currentUser
  const clearDataFormRef = useRef<HTMLFormElement>(null)
  const deleteAccountFormRef = useRef<HTMLFormElement>(null)

  return (
    <Container size="1" px="4" py={{ initial: '6', sm: '9' }}>
      <main>
        <Card size="4">
          <Flex direction="column" align="center" gap="4">
            {user && (
              <Avatar
                radius="full"
                src={user.avatarUrl ?? undefined}
                fallback={user.displayName.slice(0, 1).toUpperCase()}
                size="5"
              />
            )}
            <Heading size="6" align="center">{user ? `Welcome, ${user.displayName}` : 'Sign in to Hibiscus'}</Heading>
            <Text color="gray" align="center" size="3">
              {!state.authEnabled
                ? 'No OIDC identity provider is configured on this server.'
                : user
                  ? 'Your identity is connected. Bookmarks and blur rules are saved to your account on this server.'
                  : `Use ${state.authProviderName} to sign in. Hibiscus never sees your password.`}
            </Text>

            {notice && (
              <Text color="green" align="center" role="status">
                {notice === 'data_cleared'
                  ? 'Your saved bookmarks and blurred tag rules have been cleared.'
                  : 'Your Hibiscus account and saved data have been deleted.'}
              </Text>
            )}

            {error && (
              <Text color="ruby" align="center" role="alert">
                {error === 'invalid_request'
                  ? 'This sign-in request expired or was already used. Please try again.'
                  : 'The identity provider could not complete sign-in. Please try again.'}
              </Text>
            )}

            {user ? (
              <>
                <Flex gap="3" wrap="wrap" justify="center">
                  <Button asChild variant="solid"><Link to={returnTo}>Continue browsing</Link></Button>
                  <form method="post" action="/auth/logout">
                    <Button type="submit" variant="soft" color="gray">Sign out</Button>
                  </form>
                </Flex>

                <Separator size="4" my="2" />

                <Flex direction="column" align="center" gap="3" width="100%">
                  <Heading as="h2" size="3">Data &amp; account</Heading>
                  <Text size="2" color="gray" align="center">
                    Clear your saved data on this server or permanently delete your Hibiscus account. Your {state.authProviderName} account is not affected.
                  </Text>
                  <form ref={clearDataFormRef} method="post" action="/auth/clear-data" hidden />
                  <form ref={deleteAccountFormRef} method="post" action="/auth/delete-account" hidden />
                  <Flex gap="3" wrap="wrap" justify="center">
                    <AlertDialog.Root>
                      <AlertDialog.Trigger>
                        <Button type="button" variant="soft" color="gray">Clear saved data</Button>
                      </AlertDialog.Trigger>
                      <AlertDialog.Content maxWidth="26rem">
                        <AlertDialog.Title>Clear saved data</AlertDialog.Title>
                        <AlertDialog.Description size="2">
                          This deletes all of your saved bookmarks and blurred tag rules on this server. You will remain signed in.
                        </AlertDialog.Description>
                        <Flex gap="3" mt="4" justify="end">
                          <AlertDialog.Cancel>
                            <Button type="button" variant="soft" color="gray">Cancel</Button>
                          </AlertDialog.Cancel>
                          <AlertDialog.Action>
                            <Button type="button" color="ruby" onClick={() => clearDataFormRef.current?.requestSubmit()}>
                              Clear data
                            </Button>
                          </AlertDialog.Action>
                        </Flex>
                      </AlertDialog.Content>
                    </AlertDialog.Root>

                    <AlertDialog.Root>
                      <AlertDialog.Trigger>
                        <Button type="button" variant="soft" color="ruby">Delete account</Button>
                      </AlertDialog.Trigger>
                      <AlertDialog.Content maxWidth="26rem">
                        <AlertDialog.Title>Delete Hibiscus account</AlertDialog.Title>
                        <AlertDialog.Description size="2">
                          This permanently deletes your Hibiscus profile, active sessions, bookmarks, and blurred tag rules, and signs you out.
                        </AlertDialog.Description>
                        <Flex gap="3" mt="4" justify="end">
                          <AlertDialog.Cancel>
                            <Button type="button" variant="soft" color="gray">Cancel</Button>
                          </AlertDialog.Cancel>
                          <AlertDialog.Action>
                            <Button type="button" color="ruby" onClick={() => deleteAccountFormRef.current?.requestSubmit()}>
                              Delete account
                            </Button>
                          </AlertDialog.Action>
                        </Flex>
                      </AlertDialog.Content>
                    </AlertDialog.Root>
                  </Flex>
                </Flex>
              </>
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
