import { Box, Flex, Heading, Link } from "@radix-ui/themes";
import { DiscordLogoIcon } from '@radix-ui/react-icons';

const FooterLinkCommunity = () => {
  return (
    <Box>
      <Heading size="3" mb="2">
        Community
      </Heading>
      <Link size="2" color="gray" href="#">Changelog</Link>
      <Flex direction="column" gap="1">
        <Link size="2" color="gray" href="https://discord.saebasol.org" style={{ display: 'flex', alignItems: 'center' }}>
          <DiscordLogoIcon style={{ marginRight: '6px' }} />
          Discord
        </Link>
      </Flex>
    </Box>
  )
}



export default FooterLinkCommunity;