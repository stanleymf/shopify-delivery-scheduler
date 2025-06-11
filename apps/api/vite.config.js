var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
import { defineConfig } from 'vite';
import { VitePluginNode } from 'vite-plugin-node';
export default defineConfig({
    server: {
        port: 3001
    },
    plugins: __spreadArray([], VitePluginNode({
        adapter: 'express',
        appPath: './src/app.ts',
        exportName: 'viteNodeApp',
        tsCompiler: 'esbuild'
    }), true),
    optimizeDeps: {
        exclude: [
            'fsevents'
        ]
    }
});
