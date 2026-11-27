import { useEffect, useState, type RefObject } from 'react'
import { Button, Flex, IconButton, Link, Select, Text } from '@radix-ui/themes'
import { ArrowLeftIcon, EnterFullScreenIcon, ExitFullScreenIcon } from '@radix-ui/react-icons'
import type { ImageSize } from './ReaderPage'
import type { ReadingDirection } from './types'
import { BookmarkButton } from '../Bookmarks'

interface ViewerHeaderProps {
  reader: RefObject<HTMLElement | null>
  workId: number
  title: string
  imageSize: ImageSize
  direction: ReadingDirection
  webtoon: boolean
  onToggleWebtoon: () => void
  onSizeChange: (size: ImageSize) => void
  onToggleDirection: () => void
}

export default function ViewerHeader({ reader, workId, title, imageSize, direction, webtoon, onToggleWebtoon, onSizeChange, onToggleDirection }: ViewerHeaderProps) {
  const [fullscreen, setFullscreen] = useState(false)
  const [canFullscreen, setCanFullscreen] = useState(false)
  const [back, setBack] = useState('/list/1')

  useEffect(() => {
    if (document.referrer) {
      const referrer = new URL(document.referrer)
      if (referrer.origin === location.origin && (referrer.pathname === '/search' || referrer.pathname === '/bookmarks' || /^\/list\/\d+$/.test(referrer.pathname))) {
        setBack(referrer.pathname + referrer.search)
      }
    }
    setCanFullscreen(document.fullscreenEnabled)
    const update = () => setFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', update)
    return () => document.removeEventListener('fullscreenchange', update)
  }, [])

  return (
    <Flex asChild align="center" gap="3" px="4" py="3" style={{ background: 'var(--gray-2)' }}>
      <header>
        <Link href={back} color="gray" highContrast aria-label={back.startsWith('/search') ? 'Back to search results' : back === '/bookmarks' ? 'Back to bookmarks' : 'Back to library'}><ArrowLeftIcon /></Link>
        <Text as="p" size="2" weight="medium" truncate title={title} style={{ flex: 1 }}>{title}</Text>
        <BookmarkButton workId={workId} title={title} compact />
        <Button size="1" variant={webtoon ? 'solid' : 'soft'} color="gray" aria-pressed={webtoon}
          onClick={onToggleWebtoon}>Webtoon</Button>
        {!webtoon && <Select.Root size="1" value={imageSize} onValueChange={value => onSizeChange(value as ImageSize)}>
          <Select.Trigger aria-label="Image size" />
          <Select.Content container={reader.current}>
            <Select.Item value="page">Fit page</Select.Item>
            <Select.Item value="width">Fit width</Select.Item>
            <Select.Item value="height">Fit height</Select.Item>
            <Select.Item value="original">Original size</Select.Item>
            <Select.Item value="zoom">Zoom 2×</Select.Item>
          </Select.Content>
        </Select.Root>}
        {!webtoon && <Button size="1" variant={direction === 'rtl' ? 'solid' : 'soft'} color="gray" aria-label="Read right to left" aria-pressed={direction === 'rtl'}
          onClick={onToggleDirection}>RTL</Button>}
        {canFullscreen && <IconButton size="1" variant="ghost" color="gray" aria-label={fullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          onClick={() => {
            const action = fullscreen ? document.exitFullscreen() : reader.current?.requestFullscreen()
            void action?.catch(() => setCanFullscreen(false))
          }}>{fullscreen ? <ExitFullScreenIcon /> : <EnterFullScreenIcon />}</IconButton>}
      </header>
    </Flex>
  )
}
