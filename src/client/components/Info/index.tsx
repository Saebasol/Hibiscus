import { Box, Card, Flex, Separator, Heading, Link } from "@radix-ui/themes"
import InfoArtist from "./Artist"
import InfoTag from "./Tag"
import InfoGroup from "./Group"
import InfoTypeBadge from "./Type"
import InfoThumbnail from "./Thumbnail"
import InfoLanguage from "./Language"
import InfoSeries from "./Series"
import InfoCharacter from "./Charactor"
import InfoDate from "./Date"
import { type RawInfoData } from "@saebasol/delphinium"

const InfoCard = ({ infoData }: { infoData: RawInfoData }) => {
  return (
    <Box width="90%">
      <Card size="3" >
        <Flex direction="column" gap="4">
          <Heading size={{ initial: '4', sm: '6' }} weight="bold" color="gray" >
            <Link href={`/viewer/${infoData.id}`} underline="hover" >
              {infoData.title}
            </Link>

          </Heading>

          <Flex justify="between" align="center" gap="4">

            <Flex gap="4" direction="column" >
              <InfoArtist artist={infoData.artists} />
              <InfoGroup group={infoData.groups} />
            </Flex>

            <Flex direction="column" gap="1">
              <InfoTypeBadge type={infoData.type} />
            </Flex>
          </Flex>


          <Separator size="4" />

          <Flex direction={{ initial: 'column', sm: 'row' }} gap="4">
            <Flex align="center" justify="center" style={{ flexShrink: 0 }}>
              <InfoThumbnail thumbnail={infoData.thumbnail} id={infoData.id} />
            </Flex>

            <Flex direction="column" gap="3" >
              <InfoLanguage language={infoData.language} />
              <InfoSeries series={infoData.series} />
              <InfoCharacter character={infoData.characters} />

              <InfoTag tag={infoData.tags} />
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