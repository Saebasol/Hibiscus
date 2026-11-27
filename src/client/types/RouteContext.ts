import type {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
  RouteGenericInterface,
} from 'fastify'

export interface PublicUser {
  id: number
  displayName: string
  avatarUrl: string | null
}

export interface AppState {
  baseUrl: string
  authEnabled: boolean
  authProviderName: string
  currentUser: PublicUser | null
}

export type RouteError =
  | { kind: 'not-found' }
  | { kind: 'invalid-id' }
  | { kind: 'empty-work' }
  | { kind: 'invalid-page'; firstPageUrl: string }
  | { kind: 'unavailable'; resource: 'work' | 'search results' | 'library'; retryUrl: string }

export interface RouteErrorData {
  error?: RouteError
}

export interface RouteContext<
  Data = unknown,
  State = AppState,
> {
  data: Data
  state: State
}

export interface ServerRouteContext<
  RouteGeneric extends RouteGenericInterface = RouteGenericInterface,
  Data = unknown,
  State = AppState,
> extends RouteContext<Data, State> {
  req: FastifyRequest<RouteGeneric>
  reply: FastifyReply
  server: FastifyInstance
}
