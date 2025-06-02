// @ts-ignore
import { useRouteContext } from '@fastify/react/client'


// @ts-ignore
export function getData({ req }) {
  return { index: req.params.index }
}

const Index = () => {
  const { data } = useRouteContext()
  return (
    <>
      <p>Path match: {data.index}</p>
    </>
  )
}

export default Index
