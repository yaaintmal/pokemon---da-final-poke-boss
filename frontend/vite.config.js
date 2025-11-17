// frontend/vite.config.js
export default {
  server: {
    port: 3003,
    proxy: {
      '/api': 'http://localhost:3006'
    }
  }
}