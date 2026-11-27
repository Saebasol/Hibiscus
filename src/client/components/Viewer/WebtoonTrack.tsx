import type { RefObject } from 'react'
import { Box } from '@radix-ui/themes'
import ReaderPage from './ReaderPage'
import type { Image } from './types'

interface WebtoonTrackProps {
  track: RefObject<HTMLDivElement | null>
  images: Image[]
  onScroll: (node: HTMLDivElement) => void
}

export default function WebtoonTrack({ track, images, onScroll }: WebtoonTrackProps) {
  return (
    <Box ref={track} position="relative" overflowY="auto" role="region" aria-label="Comic pages" tabIndex={0}
      onScroll={event => onScroll(event.currentTarget)}>
      {images.map((image, i) => (
        <Box key={i} width="100%" maxWidth={{ initial: '100%', md: '50rem' }} mx="auto"
          minHeight={i === images.length - 1 ? '100%' : undefined}>
          <ReaderPage image={image} number={i + 1} size="webtoon" />
        </Box>
      ))}
    </Box>
  )
}
