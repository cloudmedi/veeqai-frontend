import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    'process.env.NODE_ENV': '"production"', // Suppress dev logs
    __DEV__: false
  },
  esbuild: {
    drop: ['console', 'debugger'],
  },
  server: {
    port: 5173,
    host: 'localhost',
    strictPort: false,
    hmr: {
      overlay: false,  // Disable HMR error overlay
      clientPort: 5173
    },
    open: false, // Don't auto-open browser
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    rollupOptions: {
      onwarn: () => {} // Suppress build warnings
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  css: {
    postcss: './postcss.config.js',
  },
})