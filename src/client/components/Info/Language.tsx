import { Flex, Text } from "@radix-ui/themes"

const InfoLanguage = ({ language }: { language: string }) => {
  return (
    <Flex direction="column" gap="1">
      <Text size="2" weight="medium">
        Language
      </Text>
      <Text size="2" color="gray">
        {language.charAt(0).toUpperCase() + language.slice(1)}
      </Text>
    </Flex>
  )
}

export default InfoLanguage
