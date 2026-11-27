import '@radix-ui/themes/styles.css'
import '@yaireo/tagify/dist/tagify.css'
import './components/SearchBar/Input.css'

import { Suspense } from 'react'
import { Route, Routes } from 'react-router'
import { AppRoute, Router } from '$app/core.tsx'
import { Theme } from '@radix-ui/themes'
import RouteErrorBoundary from './components/RouteErrorBoundary'

const Root = ({ url, routes, ctxHydration, routeMap }: {
  url?: string
  routes: Array<{ path: string; component: React.ComponentType }>
  ctxHydration: Record<string, unknown>
  routeMap: Record<string, Record<string, unknown>>
}) => {
  return (
    <Theme appearance="dark" accentColor="ruby">
      <Suspense>
        <Router location={url}>
          <Routes>
            {routes.map(({ path, component: Component }) => (
              <Route
                key={path}
                path={path}
                element={
                  <AppRoute
                    ctxHydration={ctxHydration}
                    ctx={routeMap[path]}
                  >

                    <RouteErrorBoundary>
                      <Component />
                    </RouteErrorBoundary>

                  </AppRoute>
                }
              />
            ))}
          </Routes>
        </Router>
      </Suspense>
    </Theme >

  )
}

export default Root
