import { Box, Heading, Flex, Link } from "@radix-ui/themes";

const FooterLinkSupport = () => {
  return (
    <Box>
      <Heading size="3" mb="2">
        Support
      </Heading>
      <Flex direction="column" gap="1">
        <Link size="2" color="gray" href="https://github.com/Saebasol/Hibiscus/issues">Report Issues</Link>
      </Flex>
    </Box>
  )
}

export default FooterLinkSupport;