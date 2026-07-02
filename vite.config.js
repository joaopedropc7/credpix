import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const PIX_API_KEY = 'a66707fda2e24b9280e85d425cf2c8c1'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/cpf': {
        target: 'https://api.amnesiatecnologia.lat',
        changeOrigin: true,
        rewrite: (path) => {
          const cpf = new URLSearchParams(path.split('?')[1] || '').get('cpf') || ''
          return `/?token=jp55cc85-6110-443a-99c5-8d778dff2b34&cpf=${cpf}`
        },
      },
      // Order matters: the more specific /api/pix-* rules must come before the generic /api/pix one
      '/api/pix-status': {
        target: 'https://apipix-delta.vercel.app',
        changeOrigin: true,
        headers: { 'api-key': PIX_API_KEY },
        rewrite: (path) => {
          const id = new URLSearchParams(path.split('?')[1] || '').get('id') || ''
          return `/api/transactions/${id}`
        },
      },
      '/api/pix-upsell': {
        target: 'https://apipix-delta.vercel.app',
        changeOrigin: true,
        headers: { 'api-key': PIX_API_KEY },
        rewrite: () => '/api/pix/generate',
      },
      '/api/pix': {
        target: 'https://apipix-delta.vercel.app',
        changeOrigin: true,
        headers: { 'api-key': PIX_API_KEY },
        rewrite: () => '/api/pix/generate',
      },
    },
  },
})
