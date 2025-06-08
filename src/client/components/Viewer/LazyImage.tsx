import React, { useEffect, useState, useRef, useMemo } from 'react'
import { Flex, Skeleton } from '@radix-ui/themes'
import { type LazyImageProps } from './types'

const LazyImage = ({ src, alt, index, dimensions, screenSize }: LazyImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const [hasError, setHasError] = useState(false)

  const imgRef = useRef<HTMLDivElement>(null)


  useEffect(() => {
    if ([0, 1, 2].includes(index)) {
      setIsInView(true)
      return
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
          id={(index + 1).toString()}
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


export default LazyImage