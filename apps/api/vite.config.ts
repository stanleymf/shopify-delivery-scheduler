import { defineConfig } from 'vite'
import { VitePluginNode } from 'vite-plugin-node'

export default defineConfig({
  server: {
    port: 3001
  },
  build: {
    target: 'node18',
    outDir: 'dist',
    rollupOptions: {
      input: 'src/app.ts',
      output: {
        format: 'es',
        entryFileNames: 'app.js'
      }
    }
  },
  plugins: [
    ...VitePluginNode({
      adapter: 'express',
      appPath: './src/app.ts',
      exportName: 'viteNodeApp',
      tsCompiler: 'esbuild'
    })
  ],
  optimizeDeps: {
    exclude: [
      'fsevents'
    ]
  }
}) 