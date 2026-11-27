import { Button } from '@radix-ui/themes'
import ErrorPage from '../components/ErrorPage'
import type { ServerRouteContext } from '../types/RouteContext'

export const getData = ({ reply }: ServerRouteContext) => {
  reply.code(418)
  return {}
}

export const getMeta = () => ({
  title: "I'm a teapot | Hibiscus",
})

export default function Coffee() {
  return (
    <ErrorPage
      status={418}
      title="I'm a teapot."
      description="I can't brew coffee, but I can offer you a nice cup of tea."
    >
      <Button asChild variant="solid"><a href="/brew">Brew Hibiscus tea</a></Button>
      <Button asChild variant="solid"><a href="/list/1">Back to library</a></Button>
    </ErrorPage>
  )
}
