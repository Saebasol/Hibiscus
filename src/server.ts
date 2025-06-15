import { resolve } from 'node:path'
import Fastify from 'fastify'
import FastifyVite from '@fastify/vite'
import { HeliotropeClient, HeliotropeError, type RawListData } from '@saebasol/delphinium'

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

  const imageUrl = await heliotropeClient.hitomi.getImage({ id: Number(index) })
  const galleryInfo = await heliotropeClient.hitomi.getGalleryInfo({ id: Number(index) })

  const imageUrls = imageUrl.files.map((url, i) => ({
    url: proxyImageUrl(url),
    dimensions: {
      width: galleryInfo.files[i].width,
      height: galleryInfo.files[i].height
    }
  }))

  return reply.status(200).send(imageUrls)

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

await server.vite.ready()

await server.listen({ port: 3000 })
