import Viewer from '../../components/Viewer'
import type { Image } from '../../components/Viewer/types'
import type { RouteContext, RouteError, ServerRouteContext } from '../../types/RouteContext'
import { useTypedRouteContext } from '../../utils/useRouteContext'

interface ViewerData {
  result: {
    title: string
    images: Image[]
  }
  id: number
  error?: RouteError
}

type ViewerServerContext = ServerRouteContext<{
  Params: { id: string }
}, ViewerData>

type ViewerRouteContext = RouteContext<ViewerData>

export const layout = 'viewer'


export const getData = async (ctx: ViewerServerContext): Promise<ViewerData> => {
  const id = Number(ctx.req.params.id)
  const empty = { title: '', images: [] }
  if (!/^\d+$/.test(ctx.req.params.id) || !Number.isSafeInteger(id) || id < 1) {
    ctx.reply.code(404)
    return { id, result: empty, error: { kind: 'invalid-id' } }
  }
  const response = await ctx.server.inject({ method: 'GET', url: `/internal/image/${id}?relative=1` })
  if (response.statusCode !== 200) {
    ctx.reply.code(502)
    return { id, result: empty, error: { kind: 'unavailable', resource: 'work', retryUrl: `/viewer/${id}` } }
  }
  const result = response.json<ViewerData['result']>()
  if (!result.images.length) {
    return { id, result, error: { kind: 'empty-work' } }
  }
  return { id, result }
}


export const getMeta = (ctx: ViewerRouteContext) => {
  const { result, id } = ctx.data
  const title = result.title || 'Unknown'
  const baseUrl = import.meta.env.SSR ? ctx.state.baseUrl : window.location.origin
  const pageUrl = `${baseUrl}/viewer/${id}`
  const cover = result.images[0]?.thumbnailUrl || result.images[0]?.url
  const imageUrl = cover && new URL(cover, baseUrl).href
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

  return (
    <Viewer
      key={data.id}
      images={data.result.images}
      mangaId={String(data.id)}
      title={data.result.title}
    />
  )
}

export default Index
