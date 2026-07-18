import type {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
  RouteGenericInterface,
} from 'fastify'

export interface AppState {
  baseUrl: string
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
