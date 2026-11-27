import type { RouteError, ServerRouteContext } from '../types/RouteContext'

interface NotFoundData {
  error: RouteError
}

export const getData = ({ reply }: ServerRouteContext): NotFoundData => {
  reply.code(404)
  return { error: { kind: 'not-found' } }
}

export const getMeta = () => ({
  title: 'Page not found | Hibiscus',
})

export default function NotFound() {
  return null
}
