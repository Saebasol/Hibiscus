import { Button } from '@radix-ui/themes'
import ErrorPage from '../components/ErrorPage'

export const getMeta = () => ({
  title: 'Hibiscus tea | Hibiscus',
})

export default function Brew() {
  return (
    <ErrorPage
      status={200}
      title="Hibiscus tea, freshly brewed."
      description="You found the secret tea room! The teapot swapped coffee for hibiscus petals—just this once."
    >
      <Button asChild variant="solid"><a href="/list/1">Back to library</a></Button>
    </ErrorPage>
  )
}
