// Public interface of the virtual module supplied by the Fastify Vite plugin.
import type { ComponentType, PropsWithChildren } from 'react'

export const Router: ComponentType<PropsWithChildren<{ location?: string }>>
export const AppRoute: ComponentType<PropsWithChildren<{
  ctx: Record<string, unknown>
  ctxHydration: Record<string, unknown>
}>>
