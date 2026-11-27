import type { ReactNode } from 'react'
import { Box, Container, Flex, Heading, Text } from '@radix-ui/themes'
import teaImage from '../assets/200.png'
import notFoundImage from '../assets/404.png'
import teapotImage from '../assets/418.png'
import serverErrorImage from '../assets/500.png'

interface ErrorPageProps {
  status?: number
  title: string
  description: string
  children?: ReactNode
}

export default function ErrorPage({ status, title, description, children }: ErrorPageProps) {
  const hasErrorImage = status === 200 || status === 404 || status === 418 || (status !== undefined && status >= 500 && status < 600)
  const errorImage = status === 200 ? teaImage : status === 404 ? notFoundImage : status === 418 ? teapotImage : serverErrorImage

  if (hasErrorImage) {
    return (
      <main style={{ position: 'relative', isolation: 'isolate', overflow: 'hidden' }}>
        <Text
          aria-hidden="true"
          weight="bold"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            zIndex: 0,
            transform: 'translate(-50%, -50%)',
            fontSize: 'clamp(9rem, 28vw, 26rem)',
            lineHeight: 1,
            color: 'var(--ruby-a3)',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          {status}
        </Text>
        <Container size="4" px="4" py={{ initial: '5', md: '7' }} style={{ position: 'relative', zIndex: 1 }}>
          <Flex
            direction={{ initial: 'column', md: 'row' }}
            align="center"
            justify="center"
            gap={{ initial: '4', md: '6' }}
            minHeight={{ initial: 'auto', md: '70dvh' }}
            role={status !== undefined && status >= 400 ? 'alert' : undefined}
          >
            <Flex align="center" justify="center" width={{ initial: '100%', md: '50%' }} style={{ minWidth: 0 }}>
              <Box
                asChild
                width="100%"
                maxWidth={status === 404
                  ? { initial: '18rem', md: '24rem' }
                  : { initial: '24rem', md: '32rem' }}
                maxHeight={{ initial: '45dvh', md: '55dvh' }}
                style={{
                  display: 'block',
                  height: 'auto',
                  objectFit: 'contain',
                  pointerEvents: 'none',
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                }}
              >
                <img src={errorImage} alt="" draggable={false} />
              </Box>
            </Flex>
            <Flex
              direction="column"
              align={{ initial: 'center', md: 'start' }}
              gap="4"
              width={{ initial: '100%', md: '50%' }}
              style={{ minWidth: 0 }}
            >
              <Text size="2" weight="bold" color="ruby">{status}</Text>
              <Heading as="h1" size={{ initial: '6', sm: '7', md: '8' }} align={{ initial: 'center', md: 'left' }}>
                {title}
              </Heading>
              <Text color="gray" align={{ initial: 'center', md: 'left' }}>{description}</Text>
              {children && (
                <Flex justify={{ initial: 'center', md: 'start' }} wrap="wrap" gap="3" mt="2">
                  {children}
                </Flex>
              )}
            </Flex>
          </Flex>
        </Container>
      </main>
    )
  }

  return (
    <main>
      <Container size="2" px="4" py="8">
        <Flex direction="column" align="center" justify="center" gap="4" minHeight="50dvh" role="alert">
          {status !== undefined && <Text size="2" weight="bold" color="ruby">{status}</Text>}
          <Heading as="h1" size={{ initial: '6', sm: '7' }} align="center">{title}</Heading>
          <Text color="gray" align="center">{description}</Text>
          {children && (
            <Flex justify="center" wrap="wrap" gap="3" mt="2">
              {children}
            </Flex>
          )}
        </Flex>
      </Container>
    </main>
  )
}
