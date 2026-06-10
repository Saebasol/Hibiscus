import { resolve } from 'node:path'
import Fastify from 'fastify'
import FastifyVite from '@fastify/vite'
import { HeliotropeClient, Size } from '@saebasol/delphinium'
import { env } from 'node:process'
import { IMAGE_CACHE_TTL_MS, IMAGE_CACHE_MAX } from './shared/constants.js'

declare module 'fastify' {
  interface FastifyRequest {
    baseUrl: string;
  }
}

const heliotropeClient = new HeliotropeClient({
  baseURL: env.HELIOTROPE_BASE_URL || 'https://heliotrope.saebasol.org',
  timeout: 10000 // Optional timeout
})

const imageCache = new Map<number, {
  expiresAt: number
  payload: {
    title: string
    images: {
      url: string
      thumbnailUrl?: string
      dimensions: { width: number; height: number }
    }[]
  }
}>()

const proxyImageUrl = (baseUrl: string, url: string) => `${baseUrl}/internal/proxy/${encodeURIComponent(url)}`

const proxyThumbnailUrl = async (baseUrl: string, id: number) => {
  const thumbnail = await heliotropeClient.hitomi.getThumbnail({ id, size: Size.SMALLBIG, single: true })
  return proxyImageUrl(baseUrl, thumbnail[0].url)
}

const server = Fastify({
  logger: {
    transport: {
      target: '@fastify/one-line-logger'
    }
  },
  maxParamLength: 1000,
})

await server.register(FastifyVite, {
  // TODO handle via CLI path argument with proper resolve
  root: resolve(import.meta.dirname, '..'),
  distDir: import.meta.dirname, // This file will also live in the dist folder when built
  renderer: '@fastify/react',
})

server.addHook('onRequest', async (request, reply) => {
  request.baseUrl = `${request.protocol}://${request.headers.host}`;
});

server.get('/internal/image/:id', async (request, reply) => {
  const { id } = request.params as { id: string }
  const numericId = Number(id)
  const cached = imageCache.get(numericId)
  if (cached && cached.expiresAt > Date.now()) {
    return reply
      .status(200)
      .header('cache-control', `public, max-age=${Math.floor(IMAGE_CACHE_TTL_MS / 1000)}`)
      .send(cached.payload)
  }

  const galleryInfo = await heliotropeClient.hitomi.getGalleryInfo({ id: numericId })
  const imageUrl = await heliotropeClient.hitomi.getImage({ id: numericId })
  const thumbnails = await heliotropeClient.hitomi.getThumbnail({ id: numericId, single: false, size: Size.SMALLSMALL })

  const imageUrls = imageUrl.map((item, i) => ({
    url: proxyImageUrl(request.baseUrl, item.url),
    thumbnailUrl: thumbnails[i]?.url
      ? proxyImageUrl(request.baseUrl, thumbnails[i].url)
      : undefined,
    dimensions: {
      width: item.file.width,
      height: item.file.height
    }
  }))

  const payload = {
    title: galleryInfo.title,
    images: imageUrls,
  }

  imageCache.set(numericId, { expiresAt: Date.now() + IMAGE_CACHE_TTL_MS, payload })
  if (imageCache.size > IMAGE_CACHE_MAX) {
    const oldestKey = imageCache.keys().next().value
    if (oldestKey !== undefined) {
      imageCache.delete(oldestKey)
    }
  }

  return reply
    .status(200)
    .header('cache-control', `public, max-age=${Math.floor(IMAGE_CACHE_TTL_MS / 1000)}`)
    .send(payload)
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
  try {
    const url = await proxyThumbnailUrl(request.baseUrl, Number(id))
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

await server.listen({ host: '0.0.0.0', port: 3000 })
