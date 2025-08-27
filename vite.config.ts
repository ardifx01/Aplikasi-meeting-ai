import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      plugins: [react()],
      server: {
        proxy: {
          // Proxy API requests to PHP backend
          '/api': {
            target: 'http://aplikasi-meeting-ai.test/backend/public',
            changeOrigin: true,
            secure: false,
            rewrite: (path) => path.replace(/^\/api/, '/api')
          }
        }
      }
    };
});
