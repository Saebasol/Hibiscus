import { CalendarIcon } from "@radix-ui/react-icons"
import { Flex, Text } from "@radix-ui/themes"

const InfoDate = ({ date }: { date: string }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
  }

  return (
    <Flex align="center" justify="end" gap="2">
      <CalendarIcon />
      <Text size="2" color="gray">
        {formatDate(date)}
      </Text>
    </Flex>
  )
}

export default InfoDate