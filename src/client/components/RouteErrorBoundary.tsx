import { Button } from '@radix-ui/themes'
import type { ReactNode } from 'react'
import type { RouteErrorData } from '../types/RouteContext'
import { useTypedRouteContext } from '../utils/useRouteContext'
import ErrorPage from './ErrorPage'

const unavailableContent = {
  work: {
    title: 'Unable to load work',
    description: 'The work could not be loaded. Check your connection and try again.',
  },
  'search results': {
    title: 'Unable to load search results',
    description: 'Search results could not be loaded. Check your connection and try again.',
  },
  library: {
    title: 'Unable to load library',
    description: 'The library could not be loaded. Check your connection and try again.',
  },
} as const

export default function RouteErrorBoundary({ children }: { children: ReactNode }) {
  const { data } = useTypedRouteContext<RouteErrorData | undefined>()
  const error = data?.error

  if (!error) return children

  if (error.kind === 'not-found') {
    return (
      <ErrorPage
        status={404}
        title="This place isn't on the map."
        description="The page you requested couldn't be found, so I got a little lost."
      >
        <Button asChild variant="solid"><a href="/list/1">Back to library</a></Button>
      </ErrorPage>
    )
  }

  if (error.kind === 'invalid-page') {
    return (
      <ErrorPage status={404} title="Page not found" description="This page does not exist.">
        <Button asChild><a href={error.firstPageUrl}>First page</a></Button>
        {error.firstPageUrl !== '/list/1' && (
          <Button asChild variant="soft"><a href="/list/1">Back to library</a></Button>
        )}
      </ErrorPage>
    )
  }

  if (error.kind === 'unavailable') {
    const content = unavailableContent[error.resource]
    return (
      <ErrorPage status={502} {...content}>
        <Button asChild><a href={error.retryUrl}>Try again</a></Button>
        {error.retryUrl !== '/list/1' && (
          <Button asChild variant="soft"><a href="/list/1">Back to library</a></Button>
        )}
      </ErrorPage>
    )
  }

  return (
    <ErrorPage
      status={error.kind === 'invalid-id' ? 404 : undefined}
      title={error.kind === 'invalid-id' ? 'Work not found' : 'No pages available'}
      description={error.kind === 'invalid-id'
        ? 'The requested work does not exist or has been removed.'
        : 'This work does not contain any readable pages.'}
    >
      <Button asChild variant="soft"><a href="/list/1">Back to library</a></Button>
    </ErrorPage>
  )
}
