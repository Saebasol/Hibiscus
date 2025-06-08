import { useState, useLayoutEffect } from 'react'
import LazyImage from './LazyImage'
import { type ImageRendererProps } from './types'

const ImageRenderer = ({ image, index }: ImageRendererProps) => {
  const [screenSize, setScreenSize] = useState({ width: 0, height: 0 })

  useLayoutEffect(() => {
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

  return <LazyImage
    src={image.url}
    alt={`page-${index + 1}`}
    index={index}
    dimensions={image.dimensions}
    screenSize={screenSize}
  />

}

export default ImageRenderer