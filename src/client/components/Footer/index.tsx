import { Box, Container, Flex, Separator, } from '@radix-ui/themes'
import FooterLanding from './Landing'
import FooterLink from './Link'
import FooterCredits from './Credits'

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
          <FooterCredits />
        </Flex>
      </Container>
    </Box>
  )
}

export default Footer
