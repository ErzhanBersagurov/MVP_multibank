import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: true,  // ← Разрешает ВСЕ хосты
    proxy: {
      '/api': 'http://localhost:8080',
      '/accounts': 'http://localhost:8081', 
      '/balance': 'http://localhost:8081',
      '/transfer': 'http://localhost:8082'
    }
  }
})