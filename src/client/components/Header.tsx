import { Box, Button, Flex, Heading, IconButton } from "@radix-ui/themes";
import { BookmarkIcon, ExitIcon } from "@radix-ui/react-icons";
import SearchBar from "./SearchBar";
import { BlurredTagsDialog } from "./BlurredTags";
import { Link } from "react-router";
import { useTypedRouteContext } from "../utils/useRouteContext";

const Header = () => {
  const { state } = useTypedRouteContext<unknown>()

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
                <IconButton asChild size="2" variant="solid" color="gray" aria-label="Bookmarks" title="Bookmarks">
                  <Link to="/bookmarks"><BookmarkIcon /></Link>
                </IconButton>
                <form method="post" action="/auth/logout">
                  <IconButton type="submit" size="2" variant="solid" color="gray"
                    aria-label={`Log out ${state.currentUser.displayName}`} title={`Log out ${state.currentUser.displayName}`}>
                    <ExitIcon />
                  </IconButton>
                </form>
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
