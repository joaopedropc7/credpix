import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

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
      '/api/pix': {
        target: 'https://nmxfzofqvozkooqabrno.supabase.co',
        changeOrigin: true,
        rewrite: () => '/functions/v1/pix-payment-bynet',
      },
    },
  },
})
