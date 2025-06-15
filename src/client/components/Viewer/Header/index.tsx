import { Box, Flex, Heading } from '@radix-ui/themes'
import { useViewerHeaderTitle } from '../context'

const ViewerHeader = ({ isVisible }: { isVisible: boolean }) => {
  const title = useViewerHeaderTitle()[0]

  return (
    <>
      <Box
        height="4rem"
        position="fixed"
        top="0"
        left="0"
        width="100%"
        style={{
          zIndex: 1001,
          pointerEvents: 'auto'
        }}
      />
      <Box
        height="4rem"
        position="fixed"
        top="0"
        left="0"
        width="100%"
        style={{
          backgroundColor: 'var(--color-background)',
          borderBottom: '1px solid var(--gray-6)',
          zIndex: 1000,
          transform: isVisible ? 'translateY(0)' : 'translateY(-100%)',
          transition: 'transform 0.3s ease-in-out',
          pointerEvents: isVisible ? 'auto' : 'none'
        }}

        asChild
      >
        <header>
          <Flex
            justify="between"
            align="center"
            height="100%"
            px="4"
          >
            <Heading size="5" weight="medium">
              {title}
            </Heading>

            <Flex gap="3" align="center">
              {/* 추후 버튼들 추가 예정 */}
            </Flex>
          </Flex>
        </header>
      </Box>
    </>
  )
}

export default ViewerHeader