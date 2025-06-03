import { Flex, Text } from "@radix-ui/themes";

const InfoSeries = ({ series }: { series: string[] }) => {
  if (!(series.length === 0))
    return (
      <Flex direction="column" gap="1">
        <Text size="2" weight="medium">
          Series
        </Text>
        <Text size="2" color="gray">
          {series.join(", ")}
        </Text>
      </Flex>
    )
}

export default InfoSeries;