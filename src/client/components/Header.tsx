import { Box, Button, Flex, Heading } from "@radix-ui/themes";
import SearchBar from "./SearchBar";
import { useNavigate } from "react-router";
import { BookmarkIcon } from "@radix-ui/react-icons";

const Header = () => {
  const navigate = useNavigate()

  return (
    <>
      <Box
        position="sticky"
        top="0"
        height="4rem"
        style={{
          zIndex: 1000,
          height: '4rem',
          backgroundColor: 'var(--color-background)',
          borderBottom: '1px solid var(--gray-6)'
        }}
        asChild
      >
        <header>
          <Flex
            justify="between"
            align="center"
            height="100%"
            px="3"
          >
            <Heading size="5" weight="bold" onClick={() => navigate('/')}>
              Hibiscus
            </Heading>

            <Flex gap="3" align="center" >
              <Button color="gray" onClick={() => navigate("/bookmark")}>
                  <BookmarkIcon />
              </Button>
              <SearchBar />
            </Flex>
          </Flex>
        </header>
      </Box>
    </>
  );
}

export default Header;