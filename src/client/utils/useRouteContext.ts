// @ts-expect-error @fastify/react does not publish declarations for its client module.
import { useRouteContext } from '@fastify/react/client'
import type { AppState, RouteContext } from '../types/RouteContext'

export function useTypedRouteContext<
  Data,
  State = AppState,
>(): RouteContext<Data, State> {
  return useRouteContext() as RouteContext<Data, State>
}
