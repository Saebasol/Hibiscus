import { resolve } from 'node:path'
import Fastify from 'fastify'
import FastifyVite from '@fastify/vite'

const server = Fastify({
  logger: {
    transport: {
      target: '@fastify/one-line-logger'
    }
  }
})

server.get('/internal/image/:index', async (request, reply) => {
  const { index } = request.params as { index: string }

  const imageUrlResponse = await fetch(`https://heliotrope.saebasol.org/api/hitomi/image/${index}`)
  const galleryInfoResponse = await fetch(`https://heliotrope.saebasol.org/api/hitomi/galleryinfo/${index}`)
  const imageUrl = await imageUrlResponse.json() as { files: string[] }
  const galleryInfoFiles = await galleryInfoResponse.json() as { files: { width: number, height: number }[] }

  const imageUrls = imageUrl.files.map((url, i) => ({
    url: `https://heliotrope.saebasol.org/api/proxy/${encodeURIComponent(url)}`,
    dimensions: {
      width: galleryInfoFiles.files[i].width,
      height: galleryInfoFiles.files[i].height
    }
  }))

  return reply.status(200).send(imageUrls)

})

server.get('/internal/list/:index', async (request, reply) => {
  const { index } = request.params as { index: string }
  const response = await fetch(`https://heliotrope.saebasol.org/api/hitomi/list/${index}`)
  if (!response.ok) {
    return reply.status(500).send({ error: 'Failed to fetch data from the API' })
  }
  const data = await response.json()
  return reply.status(200).send(data)
})

await server.register(FastifyVite, {
  // TODO handle via CLI path argument with proper resolve
  root: resolve(import.meta.dirname, '..'),
  distDir: import.meta.dirname, // This file will also live in the dist folder when built
  renderer: '@fastify/react',
})

await server.vite.ready()

await server.listen({ port: 3000 })
