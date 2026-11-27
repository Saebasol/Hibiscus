import { Flex, Text, Badge } from "@radix-ui/themes";
import { Link } from "react-router";
import { filterSearchUrl } from "../../utils/catalog";

const InfoSeries = ({ series }: { series: string[] }) => {
  if (!(series.length === 0))
    return (
      <Flex direction="column" gap="1">
        <Text size="2" weight="medium">
          Series
        </Text>
        <Flex gap="1" wrap="wrap" style={{ overflowY: "auto" }}>
          {
            series.map((s, index) => (
              <Link key={index} to={filterSearchUrl("series:", s)} style={{ textDecoration: "none" }}>
                <Badge
                  size="1"
                  variant="soft"
                  color="gray"
                  style={{ cursor: "pointer" }}
                >
                  {s}
                </Badge>
              </Link>
            ))
          }
        </Flex>
      </Flex>
    )
}

export default InfoSeries;