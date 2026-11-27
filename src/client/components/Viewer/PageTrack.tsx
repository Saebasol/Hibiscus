import { useRef, type RefObject } from 'react'
import { Box, Flex } from '@radix-ui/themes'
import ReaderPage, { type ImageSize } from './ReaderPage'
import type { Image, ReadingDirection } from './types'

interface PageTrackProps {
  track: RefObject<HTMLDivElement | null>
  images: Image[]
  page: number | null
  direction: ReadingDirection
  imageSize: ImageSize
  onMove: (pages: number) => void
  onScroll: (node: HTMLDivElement) => void
  onToggleZoom: () => void
}

function clickSide(track: HTMLElement, clientX: number) {
  const bounds = track.getBoundingClientRect()
  const x = (clientX - bounds.left) / bounds.width
  if (x < 1 / 3) return -1
  if (x > 2 / 3) return 1
  return 0
}

export default function PageTrack({ track, images, page, direction, imageSize, onMove, onScroll, onToggleZoom }: PageTrackProps) {
  const press = useRef<{ x: number; y: number } | null>(null)
  const step = direction === 'rtl' ? -1 : 1

  return (
    <Flex ref={track} overflowX="auto" overflowY="hidden"
      style={{ scrollSnapType: 'x mandatory', overscrollBehaviorX: 'contain', scrollbarWidth: 'none' }} dir={direction} role="region" aria-label="Comic pages" tabIndex={0}
      onPointerDown={event => {
        press.current = event.isPrimary && event.button === 0 ? { x: event.clientX, y: event.clientY } : null
      }}
      onPointerMove={event => {
        const start = press.current
        if (start && Math.hypot(event.clientX - start.x, event.clientY - start.y) > 8) press.current = null
      }}
      onPointerCancel={() => { press.current = null }}
      onClick={event => {
        const start = press.current
        press.current = null
        if (!start || (event.target instanceof Element && event.target.closest('button'))) return
        const side = clickSide(event.currentTarget, event.clientX)
        if (side && side === clickSide(event.currentTarget, start.x)) onMove(side * step)
      }}
      onDoubleClick={event => {
        if (event.target instanceof HTMLImageElement && !clickSide(event.currentTarget, event.clientX)) {
          onToggleZoom()
        }
      }}
      onScroll={event => onScroll(event.currentTarget)}>
      {images.map((image, i) => (
        <Box key={i} width="100%" minWidth="0" aria-hidden={page !== i + 1} inert={page !== i + 1}
          style={{ flexShrink: 0, scrollSnapAlign: 'start', scrollSnapStop: 'always' }}>
          {page !== null && Math.abs(page - (i + 1)) <= 1 && (
            <ReaderPage image={image} number={i + 1} size={imageSize} />
          )}
        </Box>
      ))}
    </Flex>
  )
}
