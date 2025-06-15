import { Box, Flex, Text } from '@radix-ui/themes'
import { useViewerModeWithLocalStorage } from '../context'
import { PageModeButton, ScrollModeButton } from './Button'

const ViewerFooter = ({ isVisible }: { isVisible: boolean }) => {
  const toggleViewerMode = useViewerModeWithLocalStorage()[0]
  return (
    <>
      <Box
        height="4rem"
        position="fixed"
        bottom="0"
        left="0"
        width="100%"
        style={{
          zIndex: isVisible ? 1001 : -1,
          pointerEvents: 'auto',
          backgroundColor: 'transparent'
        }}
      />

      <Box
        height="4rem"
        position="fixed"
        bottom="0"
        left="0"
        width="100%"
        style={{
          backgroundColor: 'var(--color-background)',
          borderTop: '1px solid var(--gray-6)',
          zIndex: isVisible ? 1001 : -1,
          transform: isVisible ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.3s ease-in-out',
          pointerEvents: isVisible ? 'auto' : 'none'
        }}
        asChild
      >
        <footer>
          <Flex
            justify="between"
            align="center"
            height="100%"
            px="4"
          >
            <Text size="2" color="gray">
              {/* 현재 페이지 정보 등 */}
            </Text>

            <Flex gap="3" align="center">
              {toggleViewerMode ? <ScrollModeButton /> : <PageModeButton />}
            </Flex>
          </Flex>
        </footer>
      </Box>
    </>
  )
}

export default ViewerFooter