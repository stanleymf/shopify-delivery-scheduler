import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: 'src/index.ts',
      name: 'DeliveryScheduler',
      fileName: 'delivery-scheduler',
      formats: ['iife', 'es']
    },
    rollupOptions: {
      output: {
        globals: {
          // No external globals needed since we're bundling everything
        }
      }
    }
  },
  define: {
    global: 'globalThis',
    'process.env': '{}'
  }
}) 