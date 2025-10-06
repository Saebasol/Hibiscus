import { resolve } from 'node:path'
import Fastify from 'fastify'
import FastifyVite from '@fastify/vite'
import { HeliotropeClient, Size } from '@saebasol/delphinium'

import { env } from 'node:process'

declare module 'fastify' {
  interface FastifyRequest {
    baseUrl: string;
  }
}

const heliotropeClient = new HeliotropeClient({
  baseURL: env.HELIOTROPE_BASE_URL || 'https://heliotrope.saebasol.org',
  timeout: 5000 // Optional timeout
})

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

server.get('/internal/image/:index', async (request, reply) => {
  const { index } = request.params as { index: string }
  const galleryInfo = await heliotropeClient.hitomi.getGalleryInfo({ id: Number(index) })
  const imageUrl = await heliotropeClient.hitomi.getImage({ id: Number(index) })

  const imageUrls = imageUrl.map((item, i) => ({
    url: proxyImageUrl(request.baseUrl, item.url),
    dimensions: {
      width: item.file.width,
      height: item.file.height
    }
  }))

  return reply.status(200).send({
    title: galleryInfo.title,
    images: imageUrls,
  })
})

server.get('/internal/list/:index', async (request, reply) => {
  const { index } = request.params as { index: string }
  try {
    const response = await heliotropeClient.hitomi.getList({ index: Number(index) })
    const thumbnailPromises = response.items.map(item => proxyThumbnailUrl(request.baseUrl, item.id))
    const thumbnails = await Promise.all(thumbnailPromises)
    const result = {
      ...response,
      items: response.items.map((item, idx) => ({
        ...item,
        thumbnail: thumbnails[idx]
      }))
    }

    return reply.status(200).send(result)
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
    const response = await fetch(heliotropeClient.baseURL + '/proxy/' + encodeURIComponent(url), {
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
