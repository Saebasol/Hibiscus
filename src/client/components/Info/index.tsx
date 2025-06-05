import { Box, Card, Flex, Separator, Heading } from "@radix-ui/themes"
import { type HeliotropeInfo } from "../../contexts/ViewerContext"
import InfoArtist from "./Artist"
import InfoTag from "./Tag"
import InfoGroup from "./Group"
import InfoTypeBadge from "./Type"
import InfoThumbnail from "./Thumbnail"
import InfoLanguage from "./Language"
import InfoSeries from "./Series"
import InfoCharacter from "./Charactor"
import InfoDate from "./Date"

const InfoCard = ({ infoData }: { infoData: HeliotropeInfo }) => {
  return (
    <Box width="90%">
      <Card size="3" >
        <Flex direction="column" gap="4">
          <Heading size="6" weight="bold">
            {infoData.title}
          </Heading>

          <Flex justify="between" align="center" gap="4">

            <Flex gap="4" direction="column" >
              <InfoArtist artist={infoData.artist} />
              <InfoGroup group={infoData.group} />
            </Flex>

            <Flex direction="column" gap="1">
              <InfoTypeBadge type={infoData.type} />
            </Flex>
          </Flex>


          <Separator size="4" />

          <Flex direction={{ initial: 'column', sm: 'row' }} gap="4">
            <Flex align="center" justify="center" style={{ flexShrink: 0 }}>
              <InfoThumbnail thumbnail={infoData.thumbnail} />
            </Flex>

            <Flex direction="column" gap="3" >
              <InfoLanguage language={infoData.language} />
              <InfoSeries series={infoData.series} />
              <InfoCharacter character={infoData.character} />

              <InfoTag tag={infoData.tag} />
            </Flex>
          </Flex>

          <Separator size="4" />

          <InfoDate date={infoData.date} />

        </Flex>
      </Card>
    </Box>

  )
}

export default InfoCard