import { PersonIcon } from "@radix-ui/react-icons";
import { Flex, Text } from "@radix-ui/themes";

const InfoArtist = ({ artist }: { artist: string[] }) => {
  if (!(artist.length === 0))
    return (
      <Flex align="center" gap="2">
        <PersonIcon style={{ flexShrink: 0 }} />
        <Text color="gray" size="1" weight="medium">
          {artist.join(", ")}
        </Text>
      </Flex>
    )
}

export default InfoArtist;