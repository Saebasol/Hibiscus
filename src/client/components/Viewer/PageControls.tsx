import type { ReactNode } from 'react'
import { Flex, IconButton, Slider, Text } from '@radix-ui/themes'
import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons'
import type { ReadingDirection } from './types'

interface PageControlsProps {
  total: number
  page: number | null
  direction: ReadingDirection
  children: ReactNode
  onGoTo: (page: number) => void
  onMove: (pages: number) => void
}

export default function PageControls({ page, total, direction, onGoTo, onMove, children }: PageControlsProps) {
  return (
    <Flex asChild align="center" gap="3" px="4" py="3" style={{ background: 'var(--gray-2)' }}>
      <footer>
        <Flex align="center" gap="2" dir={direction}>
          <IconButton variant="soft" color="gray" aria-label="Previous page" disabled={page === null || page === 1}
            onClick={() => onMove(-1)}>{direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}</IconButton>
          <Text size="2" role="status" dir="ltr">{page ?? '–'} / {total}</Text>
          <IconButton variant="soft" color="gray" aria-label="Next page" disabled={page === null || page === total}
            onClick={() => onMove(1)}>{direction === 'ltr' ? <ChevronRightIcon /> : <ChevronLeftIcon />}</IconButton>
        </Flex>
        <Slider size="1" min={1} max={Math.max(2, total)} value={[page ?? 1]} dir={direction}
          role="group" aria-label="Go to page" disabled={total === 1 || page === null}
          style={{ flex: 1, minWidth: 0 }} onValueChange={([next]) => onGoTo(next)} />
        {children}
      </footer>
    </Flex>
  )
}
