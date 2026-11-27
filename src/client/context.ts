import type { FastifyRequest } from 'fastify'
import type { AppState } from './types/RouteContext'

export default function initContext(ctx: { state: AppState; req?: FastifyRequest }) {
  if (ctx.req) ctx.state.baseUrl = `${ctx.req.protocol}://${ctx.req.headers.host}`
}

export function state(): AppState {
  return { baseUrl: '' }
}
