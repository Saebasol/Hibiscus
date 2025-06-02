import { Box, Flex, Heading } from "@radix-ui/themes";

const Header = () => {
  return (
    <>
      <Box
        position="fixed"
        top="0"
        left="0"
        right="0"
        style={{
          zIndex: 1000,
          height: '64px',
          backgroundColor: 'var(--color-background, #0a0a0a)',
          borderBottom: '1px solid var(--gray-6, #333)'
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
              Hibiscus
            </Heading>

            <Flex gap="3">
              {/* 필요시 네비게이션 메뉴 추가 */}
            </Flex>
          </Flex>
        </header>
      </Box>

      {/* 헤더 높이만큼 공간 확보 */}
      <Box style={{ height: '64px' }} />
    </>
  );
}

export default Header;