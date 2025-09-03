import { resolve } from 'node:path'
import Fastify from 'fastify'
import FastifyVite from '@fastify/vite'
import { HeliotropeClient, type RawListData } from '@saebasol/delphinium'

declare module 'fastify' {
  interface FastifyRequest {
    baseUrl: string;
  }
}

const heliotropeClient = new HeliotropeClient({
  baseURL: 'https://heliotrope.saebasol.org/api/',
  timeout: 5000 // Optional timeout
})

const proxyImageUrl = (url: string) => `${heliotropeClient.baseURL}/proxy/${encodeURIComponent(url)}`


const server = Fastify({
  logger: {
    transport: {
      target: '@fastify/one-line-logger'
    }
  }
})

await server.register(FastifyVite, {
  // TODO handle via CLI path argument with proper resolve
  root: resolve(import.meta.dirname, '..'),
  distDir: import.meta.dirname, // This file will also live in the dist folder when built
  renderer: '@fastify/react',
})

await server.register((fastify) => {
  fastify.addHook('onRequest', async (request, reply) => {
    request.baseUrl = `${request.protocol}://${request.headers.host}`;
  });
})

server.get('/internal/image/:index', async (request, reply) => {
  const { index } = request.params as { index: string }

  const galleryInfo = await heliotropeClient.hitomi.getGalleryInfo({ id: Number(index) })
  const imageUrl = await heliotropeClient.hitomi.getImage({ id: Number(index) })


  const imageUrls = imageUrl.files.map((url, i) => ({
    url: proxyImageUrl(url),
    dimensions: {
      width: galleryInfo.files[i].width,
      height: galleryInfo.files[i].height
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
    const response = await heliotropeClient.hitomi.getList({ id: Number(index) })
    const copied: RawListData = JSON.parse(JSON.stringify(response))
    copied.list = copied.list.map(item => ({
      ...item,
      thumbnail: proxyImageUrl(item.thumbnail),
    }))
    return reply.status(200).send(copied)
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
    return reply.status(200).header('Cache-Control', 'public, max-age=31536000 immutable').send(response)
  } catch (error) {
    return reply.status(500).send({ error: error })
  }
})

await server.vite.ready()

await server.listen({ host: '0.0.0.0', port: 3000 })
