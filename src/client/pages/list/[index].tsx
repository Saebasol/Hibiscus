// @ts-ignore
import { useRouteContext } from '@fastify/react/client'
import InfoCard from '../../components/Info'
import { Flex } from '@radix-ui/themes'
import { type RawListResultDTOData } from '@saebasol/delphinium'
import Pagenator from '../../components/Pagenator'
import { useNavigate } from 'react-router'


// @ts-ignore
export const getData = async ctx => {
  const index = Number(ctx.req.params.index) || 1

  const response = await fetch(ctx.state.baseUrl + `/internal/list/${index}`)

  if (!response.ok) {
    return {
      results: { items: [], count: 0 } as RawListResultDTOData,
      index: index
    }
  }
  const data = await response.json()

  return {
    results: data,
    index: index
  }

}

const Index = () => {
  const { data }: { data: { results: RawListResultDTOData, index: number } } = useRouteContext()
  const navigate = useNavigate()

  const onPageChange = (page: number) => {
    navigate(`/list/${page}`,)
  }


  return (
    <Flex
      m="4"
      direction="column"
      gap="4"
      align="center"
    >
      {
        data.results.items.map((item) => (
          <InfoCard
            key={item.id}
            infoData={item}
          />
        ))
      }
      <Pagenator
        count={data.results.count}
        currentPage={Number(data.index)}
        onPageChange={onPageChange}
      />
    </Flex>
  )
}

export default Index
