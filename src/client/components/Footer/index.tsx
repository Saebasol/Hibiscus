import { Box, Container, Flex, Link, Separator, Text } from '@radix-ui/themes'
import FooterLanding from './Landing'
import FooterLink from './Link'





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
            <FooterLanding />
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
