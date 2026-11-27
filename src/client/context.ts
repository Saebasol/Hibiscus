import type { FastifyInstance, FastifyRequest } from 'fastify'
import type { AppState } from './types/RouteContext'

type AuthenticatedRequest = FastifyRequest & {
  user?: {
    id: number
    displayName: string | null
    avatarUrl: string | null
  } | null
}

export default function initContext(ctx: { state: AppState; req?: FastifyRequest }) {
  if (!ctx.req) return
  const request = ctx.req as AuthenticatedRequest
  const server = request.server as FastifyInstance & { authEnabled?: boolean; authProviderName?: string }
  ctx.state.baseUrl = `${request.protocol}://${request.headers.host}`
  ctx.state.authEnabled = server.authEnabled === true
  ctx.state.authProviderName = server.authProviderName ?? 'Identity provider'
  ctx.state.currentUser = request.user ? {
    id: request.user.id,
    displayName: request.user.displayName ?? 'Reader',
    avatarUrl: request.user.avatarUrl,
  } : null
}

export function state(): AppState {
  return { baseUrl: '', authEnabled: false, authProviderName: 'Identity provider', currentUser: null }
}
