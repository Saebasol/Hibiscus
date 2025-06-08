import { Badge, Flex, Text } from "@radix-ui/themes";


const InfoCharacter = ({ character }: { character: string[] }) => {
  if (!(character.length === 0))
    return (
      <Flex direction="column" gap="1">
        <Text size="2" weight="medium">
          Characters
        </Text>
        <Flex gap="1" wrap="wrap" style={{ overflowY: "auto" }}>
          {
            character.map((c, index) => (
              <Badge
                key={index}
                size="1"
                variant="soft"
                color="gray"
                style={{ cursor: "pointer" }}
              >
                {c}
              </Badge>
            ))
          }
        </Flex>
      </Flex>
    )
}
export default InfoCharacter;



