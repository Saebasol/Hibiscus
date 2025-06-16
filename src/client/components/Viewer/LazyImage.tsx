import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react'
import { Flex, Skeleton, Button, Text } from '@radix-ui/themes'
import { ReloadIcon } from '@radix-ui/react-icons'
import { type LazyImageProps } from './types'

const LazyImage = ({ src, alt, index, dimensions, screenSize }: LazyImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [isRetrying, setIsRetrying] = useState(false)

  const imgRef = useRef<HTMLDivElement>(null)
  const MAX_RETRY_COUNT = 3

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
        threshold: 0.5,
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
    setHasError(false)
    setIsRetrying(false)
  }

  const handleError = useCallback(() => {
    if (retryCount < MAX_RETRY_COUNT) {
      setIsRetrying(true)
      setTimeout(() => {
        setRetryCount(prev => prev + 1)
      }, 1000)
    } else {
      setHasError(true)
      setIsRetrying(false)
    }
  }, [retryCount])

  const handleManualRetry = () => {
    setHasError(false)
    setIsLoaded(false)
    setRetryCount(0)
    setIsRetrying(false)
  }

  const optimalSize = useMemo(() => {
    const aspectRatio = dimensions.width / dimensions.height
    const screenWidth = screenSize.width
    const screenHeight = screenSize.height
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
      id={(index + 1).toString()}
      align="center"
      justify="center"
      ref={imgRef}
      width={`${optimalSize.width}px`}
      height={`${optimalSize.height}px`}
    >
      {!isLoaded && !hasError && !isRetrying && (
        <Skeleton
          width={`${optimalSize.width}px`}
          height={`${optimalSize.height}px`}
        />
      )}

      {isRetrying && !hasError && (
        <Flex direction="column" align="center" gap="3" p="4">
          <Skeleton
            width="60px"
            height="60px"
          />
          <Text size="2" color="gray">
            다시 시도 중... ({retryCount + 1}/{MAX_RETRY_COUNT})
          </Text>
        </Flex>
      )}

      {hasError && (
        <Flex direction="column" align="center" gap="3" p="4">
          <Text size="2" color="gray">이미지를 불러올 수 없습니다</Text>
          <Button variant="soft" onClick={handleManualRetry}>
            <ReloadIcon />
            다시 시도
          </Button>
        </Flex>
      )}

      {isInView && !hasError && (
        <img
          key={`${alt}-${retryCount}`}
          src={src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          width="100%"
          height="100%"
          style={{
            display: isLoaded ? 'block' : 'none',
            objectFit: 'contain',
            objectPosition: 'center',
          }}
        />
      )}
    </Flex>
  )
}

export default LazyImage