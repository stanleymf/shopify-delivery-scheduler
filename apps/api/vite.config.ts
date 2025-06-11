import { defineConfig } from 'vite'
import { VitePluginNode } from 'vite-plugin-node'

export default defineConfig({
  server: {
    port: 3001
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