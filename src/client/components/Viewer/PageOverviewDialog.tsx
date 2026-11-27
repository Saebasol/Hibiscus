import { developmentThumbnail } from '../../utils/developmentThumbnail'
import { Button, Dialog, Flex, Grid } from '@radix-ui/themes'
import type { Image } from './types'

interface PageOverviewDialogProps {
  images: Image[]
  page: number | null
  container: HTMLElement | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (page: number) => void
}

export default function PageOverviewDialog({ images, page, container, open, onOpenChange, onSelect }: PageOverviewDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Trigger><Button variant="soft" color="gray">Pages</Button></Dialog.Trigger>
      <Dialog.Content maxWidth="40rem" container={container}>
        <Flex align="center" justify="between" mb="3">
          <Dialog.Title mb="0">Pages</Dialog.Title>
          <Dialog.Close><Button variant="soft" color="gray">Close</Button></Dialog.Close>
        </Flex>
        <Grid columns="repeat(auto-fill, minmax(4.5rem, 1fr))" gap="2">
          {images.map((image, index) => {
            const number = index + 1
            const selected = page === number
            return (
              <Dialog.Close key={number}>
                <Button variant={selected ? 'solid' : 'soft'} color="gray" style={{ height: 'auto' }}
                  aria-label={`Go to page ${number}`} aria-current={selected ? 'page' : undefined}
                  onClick={() => onSelect(number)}>
                  <Flex direction="column" align="center" gap="1" py="1" width="100%">
                    <img loading="lazy" src={developmentThumbnail ?? image.thumbnailUrl ?? image.url} alt=""
                      style={{ width: '100%', height: '5rem', objectFit: 'contain' }} />
                    {number}
                  </Flex>
                </Button>
              </Dialog.Close>
            )
          })}
        </Grid>
      </Dialog.Content>
    </Dialog.Root>
  )
}
