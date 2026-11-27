import 'dotenv/config'
import { resolve } from 'node:path'
import Fastify, { type FastifyRequest } from 'fastify'
import FastifyCookie from '@fastify/cookie'
import FastifyFormbody from '@fastify/formbody'
import FastifyVite from '@fastify/vite'
import { HeliotropeClient, Size } from '@saebasol/delphinium'
import { env } from 'node:process'
import { IMAGE_CACHE_TTL_MS, IMAGE_CACHE_MAX } from './shared/constants.js'
import type HibiscusDatabase from './server/database.js'
import { readOidcConfig, registerAuth } from './server/auth.js'
import { registerBookmarkRoutes } from './server/bookmarks.js'

declare module 'fastify' {
  interface FastifyRequest {
    baseUrl: string;
  }
}

const heliotropeClient = new HeliotropeClient({
  baseURL: env.HELIOTROPE_BASE_URL || 'https://heliotrope.saebasol.org',
  timeout: 10000 // Optional timeout
})

interface Gallery {
  title: string
  images: {
    url: string
    thumbnailUrl?: string
    dimensions: { width: number; height: number }
  }[]
}

const imageCache = new Map<number, { expiresAt: number; payload: Gallery }>()

const proxyImageUrl = (baseUrl: string, url: string) => `${baseUrl}/internal/proxy/${encodeURIComponent(url)}`

const proxyThumbnailUrl = async (baseUrl: string, id: number) => {
  const thumbnail = await heliotropeClient.hitomi.getThumbnail({ id, size: Size.SMALLBIG, single: true })
  return proxyImageUrl(baseUrl, thumbnail[0].url)
}

const oidcConfig = readOidcConfig()
const database: HibiscusDatabase | null = oidcConfig
  ? new (await import('./server/database.js')).default(
      env.DATABASE_PATH || resolve(import.meta.dirname, '..', 'data', 'hibiscus.db'),
    )
  : null
const server = Fastify({
  logger: {
    transport: {
      target: '@fastify/one-line-logger'
    }
  },
  trustProxy: env.TRUST_PROXY === 'true',
  routerOptions: {
    maxParamLength: 1000,
  },
})

await server.register(FastifyCookie)
await server.register(FastifyFormbody)
if (database) server.addHook('onClose', async () => database.close())

await server.register(FastifyVite, {
  // TODO handle via CLI path argument with proper resolve
  root: resolve(import.meta.dirname, '..'),
  // distDir: import.meta.dirname, // This file will also live in the dist folder when built
  renderer: '@fastify/react',
})

server.addHook('onRequest', async (request) => {
  request.baseUrl = `${request.protocol}://${request.headers.host}`;
});

await registerAuth(server, database)
registerBookmarkRoutes(server, database)

server.get('/', async (_, reply) => reply.redirect('/list/1'))

async function loadGallery(id: number, request: FastifyRequest) {
  const cached = imageCache.get(id)
  if (cached && cached.expiresAt > Date.now()) return cached.payload

  const [gallery, originals, thumbnails] = await Promise.all([
    heliotropeClient.hitomi.getGalleryInfo({ id }),
    heliotropeClient.hitomi.getImage({ id }),
    server.vite.runtimeConfig.dev ? [] : heliotropeClient.hitomi.getThumbnail({ id, single: false, size: Size.SMALLSMALL }).catch(error => {
      request.log.warn({ err: error, galleryId: id }, 'Thumbnails unavailable')
      return []
    }),
  ])
  const payload: Gallery = {
    title: gallery.title,
    images: originals.map((item, i) => ({
      url: proxyImageUrl('', item.url),
      thumbnailUrl: thumbnails[i]?.url ? proxyImageUrl('', thumbnails[i].url) : undefined,
      dimensions: { width: item.file.width, height: item.file.height },
    })),
  }
  imageCache.set(id, { expiresAt: Date.now() + IMAGE_CACHE_TTL_MS, payload })
  if (imageCache.size > IMAGE_CACHE_MAX) {
    const oldestKey = imageCache.keys().next().value
    if (oldestKey !== undefined) imageCache.delete(oldestKey)
  }
  return payload
}

server.get<{ Params: { id: string }; Querystring: { relative?: string } }>('/internal/image/:id', async (request, reply) => {
  const payload = await loadGallery(Number(request.params.id), request)
  reply.header('cache-control', `public, max-age=${Math.floor(IMAGE_CACHE_TTL_MS / 1000)}`)
  if (request.query.relative === '1') return payload
  return {
    ...payload,
    images: payload.images.map(image => ({
      ...image,
      url: request.baseUrl + image.url,
      thumbnailUrl: image.thumbnailUrl && request.baseUrl + image.thumbnailUrl,
    })),
  }
})

server.get('/internal/list/:index', async (request, reply) => {
  const { index } = request.params as { index: string }
  try {
    const response = await heliotropeClient.hitomi.getList({ index: Number(index) })
    return reply.status(200).send(response)
  } catch (error) {
    return reply.status(500).send({ error: error })
  }
})

server.get('/internal/thumbnail/:id', async (request, reply) => {
  const { id } = request.params as { id: string }
  const { redirect } = request.query as { redirect?: string }
  try {
    const url = await proxyThumbnailUrl(redirect === '1' ? '' : request.baseUrl, Number(id))
    if (redirect === '1') return reply.redirect(url)
    return reply.status(200).send({ url })
  } catch (error) {
    return reply.status(500).send({ error: error })
  }
})

server.post('/internal/search', async (request, reply) => {
  const { query, offset } = request.body as { query: string[]; offset: number }
  try {
    const response = await heliotropeClient.hitomi.postSearch({ query, offset })
    return reply.status(200).send(response)
  } catch (error) {
    return reply.status(500).send({ error: error })
  }
})

server.get('/internal/tags', async (request, reply) => {
  try {
    const response = await heliotropeClient.hitomi.getTags(
      AbortSignal.timeout(10000)
    )
    return reply.status(200).header('cache-control', 'public, max-age=31536000 immutable').send(response)
  } catch (error) {
    return reply.status(500).header('cache-control', 'no-store').send({ error: error })
  }
})

server.get('/internal/proxy/:url', async (request, reply) => {
  const { url } = request.params as { url: string }
  try {
    const response = await fetch(heliotropeClient.baseURL + '/api/proxy/' + encodeURIComponent(url), {
      signal: AbortSignal.timeout(10000)
    })
    if (!response.ok) {
      return reply.status(response.status).send({ error: 'Failed to fetch image' })
    }

    const contentType = response.headers.get('Content-Type')
    return reply.status(200).header('Content-Type', contentType).header('Cache-Control', 'public, max-age=86400').send(response.body)

  } catch (error) {
    return reply.status(500).send({ error: error })
  }
})

await server.vite.ready()

const port = env.PORT ? Number(env.PORT) : 3000
if (!Number.isSafeInteger(port) || port < 0 || port > 65535) throw new Error('PORT must be a valid TCP port')
await server.listen({ host: env.HOST || '0.0.0.0', port })
