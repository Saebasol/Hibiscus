// @ts-ignore
import { useRouteContext } from '@fastify/react/client'
import Viewer from '../../components/Viewer'

export const layout = 'viewer'

// @ts-ignore
export const getData = async ctx => {
  const id = Number(ctx.req.params.id) || 1

  const response = await fetch(ctx.state.baseUrl + `/internal/image/${id}`)

  if (!response.ok) {
    return { id: id, images: [] }
  }
  const data = await response.json()

  return {
    results: data,
    id: ctx.req.params.id
  }
}


const Index = () => {
  const { data } = useRouteContext()

  return (
    <Viewer images={data.results} />

  )
}

export default Index