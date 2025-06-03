import '@radix-ui/themes/styles.css'

import { Suspense } from 'react'
import { Route, Routes } from 'react-router'
import { AppRoute, Router } from '$app/core.tsx'
import { Theme } from '@radix-ui/themes'

const Root = ({ url, routes, head, ctxHydration, routeMap }: {
  url: string
  routes: Array<{ path: string; component: React.ComponentType }>
  head: any
  ctxHydration?: Record<string, any>
  routeMap: Record<string, any>
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
                    //@ts-ignore
                    head={head}
                    ctxHydration={ctxHydration}
                    ctx={routeMap[path]}
                  >

                    <Component />

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