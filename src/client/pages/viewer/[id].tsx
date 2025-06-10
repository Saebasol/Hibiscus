import { useState, useEffect, useRef, useMemo } from 'react'
// @ts-ignore
import { useRouteContext } from '@fastify/react/client'
import type { Image } from '../../components/Viewer/types'
import Viewer from '../../components/Viewer'

export const layout = 'viewer'

export const clientOnly = true

// @ts-ignore
export function getData({ req }) {
  return { id: req.params.id }
}


const Index = () => {
  const { data } = useRouteContext()
  const [images, setImages] = useState<Image[]>([])

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch(`/internal/image/${data.id}`)
        if (!response.ok) {
          throw new Error('Network response was not ok')
        }
        const result = await response.json()
        setImages(result)
      } catch (error) {
        console.error('Failed to fetch images:', error)
      }
    }

    fetchImages()
  }, [data.id])

  return (
    <Viewer images={images} />

  )
}

export default Index