import { Badge, Text } from "@radix-ui/themes"

const InfoTypeBadge = ({ type }: { type: string }) => {
  return (
    <Text size="2" color="gray">
      <Badge color="green" variant="surface" size="1">
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    </Text>
  )

}

export default InfoTypeBadge