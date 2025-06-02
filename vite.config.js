import { join } from 'path'

import viteReact from '@vitejs/plugin-react'
import viteFastifyReact from '@fastify/react/plugin'

import { defineConfig } from 'vite'

export default defineConfig({
  root: join(import.meta.dirname, 'src', 'client'),
  build: {
    emptyOutDir: true,
    outDir: join(import.meta.dirname, 'dist'),
  },
  plugins: [
    viteReact(),
    viteFastifyReact({
      ts: true
    }),
  ]
})
