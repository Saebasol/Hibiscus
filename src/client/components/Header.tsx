import { useRef } from "react";
import { Avatar, Box, DropdownMenu, Flex, Heading, IconButton, Text } from "@radix-ui/themes";
import { BookmarkIcon, EnterIcon, ExitIcon, EyeClosedIcon, EyeOpenIcon, PersonIcon } from "@radix-ui/react-icons";
import SearchBar from "./SearchBar";
import { BlurredTagsDialog, useBlurredTags } from "./BlurredTags";
import { Link } from "react-router";
import { useTypedRouteContext } from "../utils/useRouteContext";

const Header = () => {
  const { state } = useTypedRouteContext<unknown>()
  const { blurAll, tags, setDialogOpen } = useBlurredTags()
  const logoutFormRef = useRef<HTMLFormElement>(null)
  const blurActive = blurAll || tags.length > 0

  return (
    <Box
      position="sticky"
      top="0"
      height="4rem"
      style={{
        zIndex: 1000,
        height: '4rem',
        backgroundColor: 'var(--color-background)',
        borderBottom: '0.0625rem solid var(--gray-6)'
      }}
      asChild
    >
      <header>
        <Flex justify="between" align="center" height="100%" px="3" gap="3">
          <Heading size="5" weight="bold">
            <Link to="/list/1" style={{ color: 'inherit', textDecoration: 'none' }}>
              Hibiscus
            </Link>
          </Heading>

          <Flex gap="2" align="center">
            <SearchBar />
            {state.authEnabled && state.currentUser && (
              <form ref={logoutFormRef} method="post" action="/auth/logout" hidden />
            )}
            <DropdownMenu.Root>
              <DropdownMenu.Trigger>
                <IconButton
                  size="2"
                  radius="full"
                  variant="soft"
                  color="gray"
                  aria-label={state.currentUser ? `Profile menu (${state.currentUser.displayName})` : "Profile menu"}
                  title={state.currentUser ? state.currentUser.displayName : "Profile"}
                >
                  <PersonIcon />
                </IconButton>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content align="end" style={{ minWidth: '14rem' }}>
                <Flex align="center" gap="2" px="2" py="2">
                  <Avatar
                    size="2"
                    radius="full"
                    src={state.currentUser?.avatarUrl ?? undefined}
                    fallback={state.currentUser ? state.currentUser.displayName.slice(0, 1).toUpperCase() : <PersonIcon />}
                  />
                  <Flex direction="column" gap="0" style={{ minWidth: 0 }}>
                    <Text size="2" weight="bold" truncate>
                      {state.currentUser ? state.currentUser.displayName : "Guest"}
                    </Text>
                    {state.currentUser && (
                      <Text size="1" color="gray" truncate>
                        {state.authProviderName}
                      </Text>
                    )}
                  </Flex>
                </Flex>
                <DropdownMenu.Separator />
                <DropdownMenu.Item asChild>
                  <Link to="/bookmarks"><BookmarkIcon /> Bookmarks</Link>
                </DropdownMenu.Item>
                <DropdownMenu.Item onSelect={() => setDialogOpen(true)}>
                  <span style={{ display: 'inline-flex' }}>
                    {blurActive ? <EyeClosedIcon /> : <EyeOpenIcon />}
                  </span>
                  <span>Blur settings</span>
                </DropdownMenu.Item>
                {state.authEnabled && (
                  <>
                    <DropdownMenu.Separator />
                    {state.currentUser ? (
                      <>
                        <DropdownMenu.Item asChild>
                          <Link to="/login"><PersonIcon /> Account</Link>
                        </DropdownMenu.Item>
                        <DropdownMenu.Item color="ruby" onSelect={() => logoutFormRef.current?.requestSubmit()}>
                          <ExitIcon /> Sign out
                        </DropdownMenu.Item>
                      </>
                    ) : (
                      <DropdownMenu.Item asChild>
                        <a href="/login"><EnterIcon /> Sign in</a>
                      </DropdownMenu.Item>
                    )}
                  </>
                )}
              </DropdownMenu.Content>
            </DropdownMenu.Root>
            <BlurredTagsDialog />
          </Flex>
        </Flex>
      </header>
    </Box>
  );
}

export default Header;
