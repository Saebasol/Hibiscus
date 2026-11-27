import { useRef } from "react";
import { Avatar, Box, Button, DropdownMenu, Flex, Heading, IconButton } from "@radix-ui/themes";
import { BookmarkIcon, ExitIcon, PersonIcon } from "@radix-ui/react-icons";
import SearchBar from "./SearchBar";
import { BlurredTagsDialog } from "./BlurredTags";
import { Link } from "react-router";
import { useTypedRouteContext } from "../utils/useRouteContext";

const Header = () => {
  const { state } = useTypedRouteContext<unknown>()
  const logoutFormRef = useRef<HTMLFormElement>(null)

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
        <Flex justify="between" align="center" height="100%" px="3">
          <Heading size="5" weight="bold">
            <Link to="/list/1" style={{ color: 'inherit', textDecoration: 'none' }}>
              Hibiscus
            </Link>
          </Heading>

          <Flex gap="2" align="center">
            <SearchBar />
            <BlurredTagsDialog />
            {state.authEnabled && (state.currentUser ? (
              <>
                <IconButton asChild size="2" variant="soft" color="gray" aria-label="Bookmarks" title="Bookmarks">
                  <Link to="/bookmarks"><BookmarkIcon /></Link>
                </IconButton>
                <form ref={logoutFormRef} method="post" action="/auth/logout" hidden />
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger>
                    <IconButton
                      size="2"
                      variant="soft"
                      color="gray"
                      aria-label={state.currentUser.displayName}
                      title={state.currentUser.displayName}
                    >
                      <Avatar
                        size="1"
                        radius="full"
                        src={state.currentUser.avatarUrl ?? undefined}
                        fallback={state.currentUser.displayName.slice(0, 1).toUpperCase()}
                      />
                    </IconButton>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Content align="end">
                    <DropdownMenu.Label>{state.currentUser.displayName}</DropdownMenu.Label>
                    <DropdownMenu.Item asChild>
                      <Link to="/bookmarks"><BookmarkIcon /> Bookmarks</Link>
                    </DropdownMenu.Item>
                    <DropdownMenu.Item asChild>
                      <Link to="/login"><PersonIcon /> Account</Link>
                    </DropdownMenu.Item>
                    <DropdownMenu.Separator />
                    <DropdownMenu.Item color="ruby" onSelect={() => logoutFormRef.current?.requestSubmit()}>
                      <ExitIcon /> Log out
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Root>
              </>
            ) : (
              <Button asChild size="1" variant="solid">
                <a href="/login">Log in</a>
              </Button>
            ))}
          </Flex>
        </Flex>
      </header>
    </Box>
  );
}

export default Header;
