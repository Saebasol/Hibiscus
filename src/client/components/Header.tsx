import { Box, Flex, Heading } from "@radix-ui/themes";
import SearchBar from "./SearchBar";
import { Link } from "react-router";

const Header = () => {
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
          borderBottom: '0.0625rem solid var(--gray-6)'
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
            <Heading size="5" weight="bold">
              <Link to="/list/1" style={{ color: 'inherit', textDecoration: 'none' }}>
                Hibiscus
              </Link>
            </Heading>

            <Flex gap="3">
              <SearchBar />
            </Flex>
          </Flex>
        </header>
      </Box>
    </>
  );
}

export default Header;