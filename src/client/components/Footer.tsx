import { Box, Container, Flex, Heading, Link, Separator, Text } from '@radix-ui/themes'

const Footer = () => {
  return (
    <Box
      style={{
        borderTop: '1px solid var(--gray-6)',
      }}
      py="6"
      px="4"
    >
      <Container size="4">
        <Flex direction="column" gap="4">
          <Flex
            justify="between"
            align="start"
            gap="6"
            direction={{ initial: 'column', sm: 'row' }}
          >
            <Box>
              <Heading size="4" mb="2">
                Hibiscus
              </Heading>
              <Text size="2" color="gray">
                Lorem ipsum dolor sit amet consectetur adipisicing elit.
              </Text>
            </Box>

            <Flex gap="6" direction={{ initial: 'column', sm: 'row' }}>
              <Flex gap="6" direction={{ initial: 'row' }}>
                <Box>
                  <Heading size="3" mb="2">
                    Terms
                  </Heading>
                  <Flex direction="column" gap="1">
                    <Link size="2" color="gray" href="#">Terms and Conditions</Link>
                    <Link size="2" color="gray" href="#">Privacy Policy</Link>
                    <Link size="2" color="gray" href="#">Legal</Link>
                  </Flex>
                </Box>
                <Box>
                  <Heading size="3" mb="2">
                    Support
                  </Heading>
                  <Flex direction="column" gap="1">
                    <Link size="2" color="gray" href="#">Report Issues</Link>
                    <Link size="2" color="gray" href="#">Copyright Claim</Link>
                  </Flex>
                </Box>
              </Flex>

              <Flex gap="6">
                <Box>
                  <Heading size="3" mb="2">
                    Community
                  </Heading>
                  <Flex direction="column" gap="1">
                    <Link size="2" color="gray" href="#">Discord</Link>
                    <Link size="2" color="gray" href="#">Announcements</Link>
                  </Flex>
                </Box>
              </Flex>
            </Flex>
          </Flex>

          <Separator size="4" />

          <Flex
            justify="between"
            align="center"
            direction={{ initial: 'column', sm: 'row' }}
            gap="2"
          >
            <Text size="1" color="gray">
              This site does not store any files on its server. All contents are provided by third parties.
            </Text>
            <Text size="1" color="gray">
              Made with ❤️ by Saebasol
            </Text>
          </Flex>
        </Flex>
      </Container>
    </Box>
  )
}

export default Footer