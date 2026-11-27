import { join } from 'path'

import viteReact from '@vitejs/plugin-react'
import viteFastifyReact from '@fastify/react/plugin'

import { defineConfig } from 'vite'

export default defineConfig({
  root: join(import.meta.dirname, 'src', 'client'),
  ssr: { noExternal: ['@yaireo/tagify'] },
  build: {
    emptyOutDir: true,
    outDir: join(import.meta.dirname, 'dist'),

  },
  server:{
    allowedHosts: ['strategic-watershed-talented-bra.trycloudflare.com', 'localhost']
  },
  plugins: [
    viteReact(),
    viteFastifyReact({
      ts: true
    }),
  ]
})
