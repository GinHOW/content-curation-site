import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [vue()],
  server: {
    host: true,
  },
  preview: {
    host: true,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('three')) {
              return 'vendor-three'
            }
            if (id.includes('vue') || id.includes('vue-router') || id.includes('@vue')) {
              return 'vendor-vue'
            }
            return 'vendor-misc'
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000,
  },
})
