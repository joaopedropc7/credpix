import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/cpf-api': {
        target: 'https://api.amnesiatecnologia.lat',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/cpf-api/, ''),
      },
      '/bynet-api': {
        target: 'https://api-gateway.techbynet.com',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/bynet-api/, ''),
      },
    },
  },
})
