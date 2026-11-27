import { useLayoutEffect, useRef, useState } from 'react'
import { Grid } from '@radix-ui/themes'
import type { ReadingDirection, ViewerProps } from './types'
import type { ImageSize } from './ReaderPage'
import { usePageNavigation } from './usePageNavigation'
import ViewerHeader from './ViewerHeader'
import PageTrack from './PageTrack'
import WebtoonTrack from './WebtoonTrack'
import PageControls from './PageControls'
import PageOverviewDialog from './PageOverviewDialog'

export default function Viewer({ images, mangaId, title }: ViewerProps) {
  const reader = useRef<HTMLElement>(null)
  const [direction, setDirection] = useState<ReadingDirection>('rtl')
  const [webtoon, setWebtoon] = useState(false)
  const [imageSize, setImageSize] = useState<ImageSize>('page')
  const [overview, setOverview] = useState(false)
  const readingDirection = webtoon ? 'ltr' : direction
  const { track, page, goTo, moveBy, syncScroll } = usePageNavigation(mangaId, images.length, readingDirection, overview, webtoon)

  useLayoutEffect(() => {
    try { setWebtoon(localStorage.getItem('hibiscus.readingMode') === 'webtoon') } catch { /* Storage is optional. */ }
  }, [])

  function toggleWebtoon() {
    setWebtoon(!webtoon)
    try { localStorage.setItem('hibiscus.readingMode', webtoon ? 'horizontal' : 'webtoon') } catch { /* Storage is optional. */ }
  }

  return (
    <Grid asChild height="100dvh" rows="auto minmax(0, 1fr) auto" style={{ background: 'var(--gray-1)' }}>
      <main ref={reader}>
        <ViewerHeader reader={reader} title={title} imageSize={imageSize} direction={direction}
          webtoon={webtoon} onToggleWebtoon={toggleWebtoon}
          onSizeChange={setImageSize} onToggleDirection={() => setDirection(dir => dir === 'rtl' ? 'ltr' : 'rtl')} />
        {webtoon ? (
          <WebtoonTrack track={track} images={images} onScroll={syncScroll} />
        ) : (
          <PageTrack track={track} images={images} page={page} direction={direction} imageSize={imageSize}
            onMove={moveBy} onScroll={syncScroll} onToggleZoom={() => setImageSize(size => size === 'zoom' ? 'page' : 'zoom')} />
        )}
        <PageControls page={page} total={images.length} direction={readingDirection} onGoTo={goTo} onMove={moveBy}>
          <PageOverviewDialog images={images} page={page} container={reader.current}
            open={overview} onOpenChange={setOverview} onSelect={goTo} />
        </PageControls>
      </main>
    </Grid>
  )
}
