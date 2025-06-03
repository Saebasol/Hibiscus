import { Box, Flex, Heading, Link } from "@radix-ui/themes";

const FooterLinkResources = () => {
  return (
    <Box>
      <Heading size="3" mb="2">
        Resources
      </Heading>
      <Flex direction="column" gap="1">
        <Link size="2" color="gray" href="#">Self-Hosting Guide</Link>
      </Flex>
    </Box>
  )
}


export default FooterLinkResources;