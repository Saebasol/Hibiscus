// @ts-ignore
import { useRouteContext } from '@fastify/react/client'
import Viewer from '../../components/Viewer'
import { useViewerHeaderTitle } from '../../components/Viewer/context'
import { useEffect } from 'react'

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
    result: data,
    id: ctx.req.params.id
  }
}


const Index = () => {
  const { data } = useRouteContext()
  const setTitle = useViewerHeaderTitle()[1]

  useEffect(() => {
    setTitle(data.result.title)
  }, [setTitle])

  return (
    <Viewer images={data.result.images} />

  )
}

export default Index