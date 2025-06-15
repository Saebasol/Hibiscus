import { CalendarIcon } from "@radix-ui/react-icons"
import { Flex, Text } from "@radix-ui/themes"
import { useEffect, useState } from "react"

const InfoDate = ({ date }: { date: string }) => {
  const [formatDate, setFormatDate] = useState("")

  useEffect(() => {
    const dateObj = new Date(date)
    const formated = dateObj.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
    setFormatDate(formated)
  }, [date])

  return (
    <Flex align="center" justify="end" gap="2">
      <CalendarIcon />
      <Text size="2" color="gray">
        {formatDate}
      </Text>
    </Flex>
  )
}

export default InfoDate