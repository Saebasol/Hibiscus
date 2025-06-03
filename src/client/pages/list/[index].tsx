// @ts-ignore
import { useRouteContext } from '@fastify/react/client'
import InfoCard from '../../components/Info'
import { Flex } from '@radix-ui/themes'
import type HeliotropeInfo from '$app/types/HeliotropeInfo'


// @ts-ignore
export function getData({ req }) {
  return { index: req.params.index }
}

const Index = () => {
  const { data } = useRouteContext()
  return (
    <Flex
      m="4"
      direction="column"
      gap="4"
      align="center"
    >
      {
        [].map((item) => (
          <InfoCard
            key={item.id}
            infoData={item}
          />
        ))
      }
    </Flex>
  )
}

export default Index
