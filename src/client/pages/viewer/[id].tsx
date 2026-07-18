import Viewer from '../../components/Viewer'
import { useViewerHeaderTitle } from '../../components/Viewer/context'
import { useEffect } from 'react'
import type { Image } from '../../components/Viewer/types'
import type { RouteContext, ServerRouteContext } from '../../types/RouteContext'
import { useTypedRouteContext } from '../../utils/useRouteContext'

interface ViewerData {
  result: {
    title: string
    images: Image[]
  }
  id: number
}

type ViewerServerContext = ServerRouteContext<{
  Params: { id: string }
}, ViewerData>

type ViewerRouteContext = RouteContext<ViewerData>

export const layout = 'viewer'


export const getData = async (ctx: ViewerServerContext): Promise<ViewerData> => {
  const id = Number(ctx.req.params.id) || 1

  const response = await fetch(ctx.state.baseUrl + `/internal/image/${id}`)

  if (!response.ok) {
    return {
      result: { title: "Unknown", images: [] },
      id: id
    }
  }
  const data = await response.json() as ViewerData['result']

  return {
    result: data,
    id: id
  }
}


export const getMeta = (ctx: ViewerRouteContext) => {
  const { result, id } = ctx.data
  const title = result.title || 'Unknown'
  const pageUrl = `${ctx.state.baseUrl}/viewer/${id}`
  const imageUrl = result.images[0]?.thumbnailUrl || result.images[0]?.url
  const description = `${title} · ${result.images.length} pages`

  return {
    title: `${title} | Hibiscus`,
    link: [
      { rel: 'canonical', href: pageUrl }
    ],
    meta: [
      { name: 'description', content: description },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:type', content: 'article' },
      { property: 'og:url', content: pageUrl },
      { property: 'og:site_name', content: 'Hibiscus' },
      { name: 'twitter:card', content: imageUrl ? 'summary_large_image' : 'summary' },
      { name: 'twitter:title', content: title },
      { name: 'twitter:description', content: description },
      ...(imageUrl
        ? [
          { property: 'og:image', content: imageUrl },
          { property: 'og:image:alt', content: title },
          { name: 'twitter:image', content: imageUrl },
          { name: 'twitter:image:alt', content: title }
        ]
        : [])
    ]
  }
}

const Index = () => {
  const { data } = useTypedRouteContext<ViewerData>()
  const setTitle = useViewerHeaderTitle()[1]

  useEffect(() => {
    setTitle(data.result.title)
  }, [setTitle, data.result.title])

  return (
    <Viewer
      images={data.result.images}
      mangaId={String(data.id)}
      title={data.result.title}
    />
  )
}

export default Index