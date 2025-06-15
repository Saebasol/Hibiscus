// @ts-ignore
import { useRouteContext } from '@fastify/react/client'
import InfoCard from '../../components/Info'
import { Flex } from '@radix-ui/themes'
import { List, type RawListData } from '@saebasol/delphinium'
import Pagenator from '../../components/Pagenator'
import { useNavigate } from 'react-router'
import { useEffect } from 'react'


// @ts-ignore
export const getData = async ctx => {
  const index = Number(ctx.req.params.index) || 1

  const response = await fetch(ctx.state.baseUrl + `/internal/list/${index}`)

  if (!response.ok) {
    return {
      results: { list: [], total: 0 } as RawListData,
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
  const { data }: { data: { results: RawListData, index: number } } = useRouteContext()
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
        data.results.list.map((item) => (
          <InfoCard
            key={item.id}
            infoData={item}
          />
        ))
      }
      <Pagenator
        count={data.results.total}
        currentPage={Number(data.index)}
        onPageChange={onPageChange}
      />
    </Flex>
  )
}

export default Index
