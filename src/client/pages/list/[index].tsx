
import WorkList from '../../components/WorkList'
import { Container } from '@radix-ui/themes'
import { type RawListResultDTOData } from '@saebasol/delphinium'
import { useNavigate } from 'react-router'
import type { RouteError, ServerRouteContext } from '../../types/RouteContext'
import { useTypedRouteContext } from '../../utils/useRouteContext'

interface ListData {
  result: RawListResultDTOData
  index: number
  error?: RouteError
}

type ListServerContext = ServerRouteContext<{
  Params: { index: string }
}, ListData>

export const getData = async (ctx: ListServerContext): Promise<ListData> => {
  const value = ctx.req.params.index
  const index = Number(value)
  const empty = { items: [], count: 0 } as RawListResultDTOData

  if (!/^\d+$/.test(value) || !Number.isSafeInteger(index) || index < 1) {
    ctx.reply.code(404)
    return { result: empty, index, error: { kind: 'invalid-page', firstPageUrl: '/list/1' } }
  }

  const response = await ctx.server.inject({ method: 'GET', url: `/internal/list/${index}` })
  if (response.statusCode !== 200) {
    ctx.reply.code(502)
    return { result: empty, index, error: { kind: 'unavailable', resource: 'library', retryUrl: `/list/${index}` } }
  }

  const result = response.json<RawListResultDTOData>()
  if (index > 1 && !result.items.length) {
    ctx.reply.code(404)
    return { result: empty, index, error: { kind: 'invalid-page', firstPageUrl: '/list/1' } }
  }
  return { result, index }
}

const Index = () => {
  const { data } = useTypedRouteContext<ListData>()
  const navigate = useNavigate()

  const onPageChange = (page: number) => {
    navigate(`/list/${page}`,)
  }

  return (
    <main>
      <Container size="4" px="4" py={{ initial: '5', sm: '7' }}>
        <WorkList
          items={data.result.items}
          count={data.result.count}
          currentPage={Number(data.index)}
          onPageChange={onPageChange}
          navLabel="List pages"
        />
      </Container>
    </main>
  )
}

export default Index
