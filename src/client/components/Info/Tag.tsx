import { Badge, Flex, Text } from "@radix-ui/themes"

const TagBadge = ({ tag }: { tag: string }) => {
  let tagColor: "gray" | "crimson" | "blue" = "gray"
  let displayTag = tag

  if (tag.startsWith("female:")) {
    tagColor = "crimson"
    displayTag = tag.replace("female:", "")
  } else if (tag.startsWith("male:")) {
    tagColor = "blue"
    displayTag = tag.replace("male:", "")
  } else if (tag.startsWith("tag:")) {
    tagColor = "gray"
    displayTag = tag.replace("tag:", "")
  }

  return (
    <Badge
      size="1"
      variant="soft"
      color={tagColor}
      style={{ cursor: "pointer" }}
    >
      {displayTag}
    </Badge>
  )
}

const InfoTag = ({ tag }: { tag: string[] }) => {
  if (!(tag.length === 0))
    return (
      <Flex direction="column" gap="2">
        <Text size="2" weight="medium">
          Tags ({tag.length})
        </Text>
        <Flex gap="1" wrap="wrap" style={{ maxHeight: "120px", overflowY: "auto" }}>
          {tag.map((tag, index) => (
            <TagBadge key={index} tag={tag} />
          ))}
        </Flex>
      </Flex>
    )
}

export default InfoTag
