import { Badge } from "@radix-ui/themes"

const TagBadge = ({ tag }: { tag: string }) => {
  let tagColor: "gray" | "ruby" | "blue" = "gray"
  let displayTag = tag

  if (tag.startsWith("female:")) {
    tagColor = "ruby"
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

export default TagBadge