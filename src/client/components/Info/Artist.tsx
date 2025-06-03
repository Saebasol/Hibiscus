import { PersonIcon } from "@radix-ui/react-icons";
import { Flex, Heading } from "@radix-ui/themes";

const InfoArtist = ({ artist }: { artist: string[] }) => {
  if (!(artist.length === 0))
    return (
      <Flex align="center" gap="2">
        <PersonIcon />
        <Heading color="gray" size="3" weight="medium">
          {artist.join(", ")}
        </Heading>
      </Flex>
    )
}

export default InfoArtist;