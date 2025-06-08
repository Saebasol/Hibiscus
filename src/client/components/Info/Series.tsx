import { Flex, Text, Badge } from "@radix-ui/themes";

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
              <Badge
                key={index}
                size="1"
                variant="soft"
                color="gray"
                style={{ cursor: "pointer" }}
              >
                {s}
              </Badge>
            ))
          }
        </Flex>
      </Flex>
    )
}

export default InfoSeries;