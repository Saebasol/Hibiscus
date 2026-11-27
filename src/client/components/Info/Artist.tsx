import { PersonIcon } from "@radix-ui/react-icons";
import { Flex, Text } from "@radix-ui/themes";
import { Fragment } from "react";
import { Link } from "react-router";
import { filterSearchUrl } from "../../utils/catalog";

const InfoArtist = ({ artist }: { artist: string[] }) => {
  if (!(artist.length === 0))
    return (
      <Flex align="center" gap="2">
        <PersonIcon style={{ flexShrink: 0 }} />
        <Text color="gray" size="1" weight="medium">
          {artist.map((name, index) => (
            <Fragment key={name}>
              {index > 0 && ", "}
              <Link to={filterSearchUrl("artist:", name)} style={{ color: "inherit", textDecoration: "none" }}>
                {name}
              </Link>
            </Fragment>
          ))}
        </Text>
      </Flex>
    )
}

export default InfoArtist;