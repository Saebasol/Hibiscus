import { useState, type CSSProperties } from 'react'
import { Button, Flex, Text } from '@radix-ui/themes'
import type { Image } from './types'

const sizes = {
  page: { width: '100%', height: '100%', objectFit: 'contain' },
  width: { width: '100%', height: 'auto' },
  height: { width: 'auto', height: '100%' },
  original: { width: 'auto', height: 'auto' },
  zoom: { width: 'min(200cqw, calc(200cqh * var(--image-ratio, 1)))', height: 'auto' },
} satisfies Record<string, CSSProperties>

export type ImageSize = keyof typeof sizes

export default function ReaderPage({ image, number, size }: {
  image: Image; number: number; size: ImageSize | 'webtoon'
}) {
  const [failed, setFailed] = useState(false)
  return (
    <Flex width="100%" height={size === 'webtoon' ? 'auto' : '100%'} overflow={size === 'webtoon' ? 'visible' : 'auto'}
      dir="ltr" style={size === 'webtoon' ? undefined : { containerType: 'size' }}>
      {failed ? (
        <Flex align="center" direction="column" gap="2" m="auto" role="status">
          <Text>Page {number} could not be loaded.</Text>
          <Button variant="soft" onClick={() => setFailed(false)}>Retry image</Button>
        </Flex>
      ) : (
        <img src={image.url} alt={`Page ${number}`} draggable={false} loading={size === 'webtoon' ? 'lazy' : undefined}
          width={image.dimensions.width || undefined} height={image.dimensions.height || undefined}
          style={size === 'webtoon'
            ? { width: '100%', height: 'auto', aspectRatio: !image.dimensions.width || !image.dimensions.height ? 'auto 3/4' : undefined }
            : { ...sizes[size], flex: 'none', margin: 'auto', maxWidth: 'none' }}
          onError={() => setFailed(true)}
          onLoad={({ currentTarget: img }) => img.style.setProperty('--image-ratio', String(img.naturalWidth / img.naturalHeight))} />
      )}
    </Flex>
  )
}
