import { Box, Container, Flex, Heading, Link, Separator, Text, Grid, Quote, Blockquote } from '@radix-ui/themes'
import { DiscordLogoIcon, GitHubLogoIcon } from '@radix-ui/react-icons'

const FooterMain = () => {
  return (
    <Box>
      <Heading size="4" mb="2">
        Hibiscus
      </Heading>
      <Blockquote>
        <Quote>
          <Text size="2" color="gray">
            Delicate beauty.
          </Text>
        </Quote>

      </Blockquote>

    </Box>
  )
}

const FooterLinkSupport = () => {
  return (
    <Box>
      <Heading size="3" mb="2">
        Support
      </Heading>
      <Flex direction="column" gap="1">
        <Link size="2" color="gray" href="#">Report Issues</Link>
      </Flex>
    </Box>
  )
}

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




const FooterLinkCommunity = () => {
  return (
    <Box>
      <Heading size="3" mb="2">
        Community
      </Heading>
      <Link size="2" color="gray" href="#">Changelog</Link>
      <Flex direction="column" gap="1">
        <Link size="2" color="gray" href="#" style={{ display: 'flex', alignItems: 'center' }}>
          <DiscordLogoIcon style={{ marginRight: '6px' }} />
          Discord
        </Link>
      </Flex>
    </Box>
  )
}

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


const FooterLink = () => {
  return (
    <Grid
      columns={{ initial: '2', sm: '4' }}
      gap="4"
      width="100%"
      style={{ maxWidth: '600px' }}
    >
      <FooterLinkSupport />
      <FooterLinkResources />
      <FooterLinkOpenSource />
      <FooterLinkCommunity />
    </Grid>
  )
}

const FooterText = () => {
  return (
    <Flex
      justify="between"
      align="center"
      direction={{ initial: 'column', sm: 'row' }}
      gap="2"
    >
      <Flex
        direction="column"
        gap="1"
        align={{ initial: 'center', sm: 'start' }}
      >
        <Text size="1" color="gray" >
          Made with ❤️ by&nbsp;
          <Link href="https://github.com/Saebasol" target="_blank" rel="noopener noreferrer">Saebasol</Link>
        </Text>
        <Text size="1" color="gray">
          Powered by&nbsp;
          <Link href="https://fastify.dev" target="_blank" rel="noopener noreferrer">Fastify</Link>&nbsp;&&nbsp;
          <Link href="https://vitejs.dev" target="_blank" rel="noopener noreferrer">Vite</Link>&nbsp;&&nbsp;
          <Link href="https://react.dev" target="_blank" rel="noopener noreferrer">React</Link>&nbsp;&&nbsp;
          <Link href="https://radix-ui.com" target="_blank" rel="noopener noreferrer">Radix UI</Link>
        </Text>

      </Flex>


      <Text size="1" color="gray">
        0.1.0
      </Text>

    </Flex >
  )
}

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
            <FooterMain />
            <FooterLink />
          </Flex>

          <Separator size="4" />
          <FooterText />
        </Flex>
      </Container>
    </Box>
  )
}

export default Footer
