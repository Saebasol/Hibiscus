import { Box, Flex, Heading, Link } from "@radix-ui/themes";
import { GitHubLogoIcon } from "@radix-ui/react-icons";

const FooterLinkOpenSource = () => {
  return (
    <Box>
      <Heading size="3" mb="2">
        Open Source
      </Heading>
      <Flex direction="column" gap="1">
        <Link size="2" color="gray" href="https://github.com/Saebasol/Heliotrope" style={{ display: 'flex', alignItems: 'center' }}>
          <GitHubLogoIcon style={{ marginRight: '6px' }} />
          Heliotrope
        </Link>
        <Link size="2" color="gray" href="https://github.com/Saebasol" style={{ display: 'flex', alignItems: 'center' }}>
          <GitHubLogoIcon style={{ marginRight: '6px' }} />
          Hibiscus
        </Link>
      </Flex>
    </Box>
  )
}
export default FooterLinkOpenSource;