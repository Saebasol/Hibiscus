import { Flex, RadioCards, Text } from "@radix-ui/themes"
import { useNavigate } from "react-router";

const SearchResultItem = ({ id, title, artist }: {
  id: number;
  title: string;
  artist: string;
}) => {
  const navigate = useNavigate();

  return (
    <RadioCards.Item
      value={id.toString()}
      style={{ width: "93%" }}
      onClick={() => {
        navigate(`/viewer/${id}`, {
          state: {
            title: title,
            artist: artist,
          },
        });
      }}
    >
      <Flex direction="column" width="100%">
        <Text weight="bold">{title}</Text>
        <Text>{artist}</Text>
      </Flex>
    </RadioCards.Item>
  )
}

export default SearchResultItem