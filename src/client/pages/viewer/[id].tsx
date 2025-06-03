import { useState, useEffect, useRef } from 'react'
// @ts-ignore
import { useRouteContext } from '@fastify/react/client'
import { Box, Flex, Spinner, Text, Button } from '@radix-ui/themes'

export const layout = "viewer"

// @ts-ignore
export function getData({ req }) {
  return { index: req.params.index }
}

interface LazyImageProps {
  src: string
  alt: string
  index: number
}

const LazyImage = ({ src, alt, index }: LazyImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [isRetrying, setIsRetrying] = useState(false)
  const imgRef = useRef<HTMLDivElement>(null)
  const maxRetries = 3

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      {
        threshold: 0.1,
        rootMargin: '100px'
      }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const handleLoad = () => {
    setIsLoaded(true)
    setHasError(false)
    setIsRetrying(false)
  }

  const handleError = () => {
    if (retryCount < maxRetries) {
      setTimeout(() => {
        setRetryCount(prev => prev + 1)
        setIsRetrying(true)
        setHasError(false)
      }, 1000)
    } else {
      setHasError(true)
      setIsRetrying(false)
    }
  }

  const handleManualRetry = () => {
    setRetryCount(0)
    setHasError(false)
    setIsRetrying(true)
    setIsLoaded(false)
  }


  return (
    <Box
      ref={imgRef}
      style={{
        minHeight: '600px',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--gray-2)',
        position: 'relative'
      }}
    >
      {!isInView && (
        <Flex direction="column" align="center" gap="2">
          <Text size="2" color="gray">
            Page {index + 1}
          </Text>
        </Flex>
      )}

      {isInView && !isLoaded && !hasError && (
        <Flex direction="column" align="center" gap="2">
          <Spinner size="3" />
          <Text size="2" color="gray">
            {isRetrying
              ? `Retrying page ${index + 1}... (${retryCount}/${maxRetries})`
              : `Loading page ${index + 1}...`
            }
          </Text>
        </Flex>
      )}

      {isInView && hasError && (
        <Flex direction="column" align="center" gap="3">
          <Text size="2" color="red">
            Failed to load page {index + 1}
          </Text>
          <Text size="1" color="gray" style={{ textAlign: 'center', wordBreak: 'break-all' }}>
            Attempted {retryCount} times
          </Text>
          <Button
            size="2"
            variant="soft"
            color="blue"
            onClick={handleManualRetry}
          >
            Retry
          </Button>
          <Text size="1" color="gray" style={{ maxWidth: '300px', textAlign: 'center', wordBreak: 'break-all' }}>
            {src}
          </Text>
        </Flex>
      )}

      {isInView && (
        <img
          key={`${src}-${retryCount}`} // key 변경으로 컴포넌트 재렌더링 강제
          src={src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          style={{
            maxWidth: '100%',
            height: 'auto',
            display: isLoaded && !hasError ? 'block' : 'none',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
          }}
        />
      )}
    </Box>
  )
}

interface ImageViewerProps {
  images: string[]
}

const ImageViewer = ({ images }: ImageViewerProps) => {
  return (
    <Flex direction="column" gap="4" style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      {images.map((imageUrl, index) => (
        <LazyImage
          key={index}
          src={imageUrl}
          alt={`Page ${index + 1}`}
          index={index}
        />
      ))}
    </Flex>
  )
}

const Index = () => {
  const { data } = useRouteContext()

  const sampleImages = []

  return (
    <Box>
      <Flex direction="column" align="center" gap="4" style={{ padding: '20px' }}>
        <ImageViewer images={sampleImages} />
      </Flex>
    </Box>
  )
}

export default Index