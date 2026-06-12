import { Flex, Text } from "@radix-ui/themes"
import TagBadge from "./TagBadge"

const InfoTag = ({ tag }: { tag: string[] }) => {
  if (!(tag.length === 0))
    return (
      <Flex direction="column" gap="2">
        <Text size="2" weight="medium">
          Tags ({tag.length})
        </Text>
        <Flex gap="1" wrap="wrap" style={{ overflowY: "auto" }}>
          {tag.map((tag, index) => (
            <TagBadge key={index} tag={tag} />
          ))}
        </Flex>
      </Flex>
    )
}

export default InfoTag
