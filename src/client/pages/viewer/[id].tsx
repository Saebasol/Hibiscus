import { useState, useEffect, useRef, useMemo } from 'react'
// @ts-ignore
import { useRouteContext } from '@fastify/react/client'
import { Flex, Skeleton } from '@radix-ui/themes'

export const layout = 'viewer'

// @ts-ignore
export function getData({ req }) {
  return { index: req.params.index }
}

interface ImageDimensions {
  width: number
  height: number
}

interface LazyImageProps {
  src: string
  alt: string
  index: number
  dimensions: ImageDimensions
  screenSize: { width: number; height: number }
}

const LazyImage = ({ src, alt, index, dimensions, screenSize }: LazyImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const [hasError, setHasError] = useState(false)

  const imgRef = useRef<HTMLDivElement>(null)


  useEffect(() => {
    if ([0, 1, 2].includes(index)) {
      setIsInView(true)
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px 75% 0px'
      }
    )

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const handleLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
    setIsLoaded(true)
  }

  const handleError = () => {
    setHasError(true)
    setIsLoaded(true)
  }

  const optimalSize = useMemo(() => {
    const aspectRatio = dimensions.width / dimensions.height
    const screenWidth = screenSize.width || window.innerWidth
    const screenHeight = screenSize.height || window.innerHeight

    const widthBasedHeight = screenWidth / aspectRatio
    const heightBasedWidth = screenHeight * aspectRatio

    if (widthBasedHeight <= screenHeight) {
      return { width: screenWidth, height: widthBasedHeight }
    } else {
      return { width: heightBasedWidth, height: screenHeight }
    }
  }, [screenSize, dimensions])

  return (
    <Flex
      align="center"
      justify="center"
      ref={imgRef}
      width={`${optimalSize.width}px`}
      height={`${optimalSize.height}px`}
    >
      {!isLoaded && !hasError && (
        <Skeleton
          width={`${optimalSize.width}px`}
          height={`${optimalSize.height}px`}
        />
      )}

      {isInView && (
        <img
          src={src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          width="100%"
          height="100%"
          style={{
            display: isLoaded && !hasError ? 'block' : 'none',
            objectFit: 'contain',
            objectPosition: 'center',
          }}
        />
      )}


    </Flex>
  )
}

interface ImageViewerProps {
  images: Array<{
    url: string
    dimensions: ImageDimensions
  }>
}


const ImageViewer = ({ images }: ImageViewerProps) => {
  const [screenSize, setScreenSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const updateScreenSize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    updateScreenSize()
    window.addEventListener('resize', updateScreenSize)
    window.addEventListener('orientationchange', updateScreenSize)

    return () => {
      window.removeEventListener('resize', updateScreenSize)
      window.removeEventListener('orientationchange', updateScreenSize)
    }
  }, [])

  return images.map((image, index) => (
    <LazyImage
      key={index}
      src={image.url}
      alt={`page-${index + 1}`}
      index={index}
      dimensions={image.dimensions}
      screenSize={screenSize}
    />
  ))
}

const Index = () => {
  const { data } = useRouteContext()

  const images = []

  return (
    <Flex
      direction="column"
      justify="center"
      align="center"
      gap="1rem"
    >
      <ImageViewer images={images} />
    </Flex>

  )
}

export default Index