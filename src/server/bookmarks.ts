import type { FastifyInstance, FastifyRequest } from 'fastify'
import type HibiscusDatabase from './database.js'
import { isSameOrigin } from './auth.js'

function workId(value: string): number | null {
  if (!/^[1-9]\d*$/.test(value)) return null
  const id = Number(value)
  return Number.isSafeInteger(id) ? id : null
}

function authenticatedUser(request: FastifyRequest) {
  return request.user
}

export function registerBookmarkRoutes(server: FastifyInstance, database: HibiscusDatabase | null) {
  server.get('/internal/bookmarks', async (request, reply) => {
    const user = authenticatedUser(request)
    if (!server.authEnabled || !database || !user) {
      return reply.code(401).header('cache-control', 'no-store').send({ error: 'Authentication required' })
    }
    return reply.header('cache-control', 'no-store').send({ bookmarks: database.listBookmarks(user.id) })
  })

  server.put<{ Params: { id: string }; Body: { title?: unknown } }>('/internal/bookmarks/:id', async (request, reply) => {
    if (!isSameOrigin(request)) return reply.code(403).send({ error: 'Cross-origin request rejected' })
    const user = authenticatedUser(request)
    if (!server.authEnabled || !database || !user) {
      return reply.code(401).header('cache-control', 'no-store').send({ error: 'Authentication required' })
    }

    const id = workId(request.params.id)
    const title = typeof request.body?.title === 'string' ? request.body.title.trim() : ''
    if (!id || !title || title.length > 1000) {
      return reply.code(400).send({ error: 'A valid work ID and title are required' })
    }

    database.addBookmark(user.id, id, title)
    return reply.header('cache-control', 'no-store').send({ bookmarked: true })
  })

  server.delete<{ Params: { id: string } }>('/internal/bookmarks/:id', async (request, reply) => {
    if (!isSameOrigin(request)) return reply.code(403).send({ error: 'Cross-origin request rejected' })
    const user = authenticatedUser(request)
    if (!server.authEnabled || !database || !user) {
      return reply.code(401).header('cache-control', 'no-store').send({ error: 'Authentication required' })
    }

    const id = workId(request.params.id)
    if (!id) return reply.code(400).send({ error: 'A valid work ID is required' })
    database.removeBookmark(user.id, id)
    return reply.header('cache-control', 'no-store').send({ bookmarked: false })
  })

  server.get('/internal/blurred-tags', async (request, reply) => {
    const user = authenticatedUser(request)
    if (!server.authEnabled || !database || !user) {
      return reply.code(401).header('cache-control', 'no-store').send({ error: 'Authentication required' })
    }
    return reply.header('cache-control', 'no-store').send({ tags: database.listBlurredTags(user.id) })
  })

  server.put<{ Body: { tag?: unknown } }>('/internal/blurred-tags', async (request, reply) => {
    if (!isSameOrigin(request)) return reply.code(403).send({ error: 'Cross-origin request rejected' })
    const user = authenticatedUser(request)
    if (!server.authEnabled || !database || !user) {
      return reply.code(401).header('cache-control', 'no-store').send({ error: 'Authentication required' })
    }

    const tag = typeof request.body?.tag === 'string' ? request.body.tag.trim() : ''
    if (!tag || tag.length > 200) {
      return reply.code(400).send({ error: 'A valid tag is required' })
    }

    database.addBlurredTag(user.id, tag)
    return reply.header('cache-control', 'no-store').send({ tags: database.listBlurredTags(user.id) })
  })

  server.delete<{ Params: { tag: string } }>('/internal/blurred-tags/:tag', async (request, reply) => {
    if (!isSameOrigin(request)) return reply.code(403).send({ error: 'Cross-origin request rejected' })
    const user = authenticatedUser(request)
    if (!server.authEnabled || !database || !user) {
      return reply.code(401).header('cache-control', 'no-store').send({ error: 'Authentication required' })
    }

    const tag = request.params.tag.trim()
    if (!tag || tag.length > 200) {
      return reply.code(400).send({ error: 'A valid tag is required' })
    }

    database.removeBlurredTag(user.id, tag)
    return reply.header('cache-control', 'no-store').send({ tags: database.listBlurredTags(user.id) })
  })
}
