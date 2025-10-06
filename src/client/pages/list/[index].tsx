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
      result: { items: [], count: 0 } as RawListResultDTOData,
      index: index
    }
  }
  const data = await response.json()

  return {
    result: data,
    index: index
  }

}

const Index = () => {
  const { data }: { data: { result: RawListResultDTOData, index: number } } = useRouteContext()
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
        data.result.items.map((item) => (
          <InfoCard
            key={item.id}
            infoData={item}
          />
        ))
      }
      <Pagenator
        count={data.result.count}
        currentPage={Number(data.index)}
        onPageChange={onPageChange}
      />
    </Flex>
  )
}

export default Index
