import { Flex } from '@radix-ui/themes'
import type { RawInfoData } from '@saebasol/delphinium'
import InfoCard from './Info'
import Pagenator from './Pagenator'

interface WorkListProps {
  items: RawInfoData[]
  count?: number
  currentPage?: number
  onPageChange?: (page: number) => void
  navLabel?: string
  mt?: '5'
}

export default function WorkList({ items, count, currentPage, onPageChange, navLabel = 'Pages', mt }: WorkListProps) {
  return (
    <Flex mt={mt} direction="column" gap="4" width="100%">
      {items.map(item => (
        <InfoCard key={item.id} infoData={item} />
      ))}
      {onPageChange && count !== undefined && count > 0 && currentPage !== undefined && (
        <nav aria-label={navLabel}>
          <Pagenator count={count} currentPage={currentPage} onPageChange={onPageChange} />
        </nav>
      )}
    </Flex>
  )
}
