import { useState, useMemo, useEffect } from 'react'
import { Flex } from '@radix-ui/themes'
import ImageRenderer from './ImageRenderer'
import { type ViewerProps } from './types'
import { useLocation, useNavigate } from 'react-router'

const PageViewer = ({ images }: ViewerProps) => {
  const [currentPage, setCurrentPage] = useState(0)
  const { hash } = useLocation()
  const navigate = useNavigate()


  const visibleRange = useMemo(() => {
    const buffer = 2
    const start = Math.max(0, currentPage - buffer)
    const end = Math.min(images.length, currentPage + buffer + 1)
    return { start, end }
  }, [currentPage, images.length])


  const goToNextPage = () => {
    const nextPage = (currentPage + 1) % images.length
    setCurrentPage(nextPage)
    navigate(`#${nextPage + 1}`, { replace: false })
  }

  useEffect(() => {
    if (!hash) {
      navigate(`#${currentPage + 1}`, { replace: false })
    }
  }, [currentPage, hash])


  useEffect(() => {
    if (hash && images.length > 0) {
      const pageNumber = parseInt(hash.replace('#', ''))
      if (pageNumber >= 1 && pageNumber <= images.length) {
        setCurrentPage(pageNumber - 1)
      }
    }
  }, [hash, images.length])

  return (
    <Flex
      direction="column"
      width="100%"
    >
      {
        images.slice(visibleRange.start, visibleRange.end).map((image, index) => {
          const actualIndex = visibleRange.start + index
          const isVisible = actualIndex === currentPage

          return (
            <Flex
              key={actualIndex}
              onClick={goToNextPage}
              position="absolute"
              height="calc(100vh - 8rem)"
              align="center"
              justify="center"
              left="50%"
              top="50%"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: `translate(-50%, -50%)`,
              }}
            >
              <ImageRenderer image={image} index={actualIndex} />
            </Flex>
          )
        })
      }


    </Flex>
  )
}

export default PageViewer
