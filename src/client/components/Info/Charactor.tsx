import { Flex, Text } from "@radix-ui/themes";


const InfoCharacter = ({ character }: { character: string[] }) => {
  if (!(character.length === 0))
    return (
      <Flex direction="column" gap="1">
        <Text size="2" weight="medium">
          Characters
        </Text>
        <Text size="2" color="gray">
          {character.join(", ")}
        </Text>
      </Flex>
    )
}
export default InfoCharacter;



