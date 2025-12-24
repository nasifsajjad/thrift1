import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// Use a standard export default
export default defineConfig(({ mode }) => {
  // Load env file based on current working directory
  // This helps Vite find the VITE_ variables in Render's environment
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    
    // This allows the app to run on Render's preview/static domain
    preview: {
      allowedHosts: ['thrift1trip.onrender.com'],
      port: 3000,
      host: '0.0.0.0',
    },

    server: {
      port: 3000,
      host: '0.0.0.0',
    },

    define: {
      // Vital for ensuring your API keys are injected at build time
      'process.env.VITE_GEMINI_API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY),
    },

    resolve: {
      alias: {
        '@': path.resolve(__dirname, './'),
      },
    },
    
    // Explicitly set the build output directory (Render default is 'dist')
    build: {
      outDir: 'dist',
    }
  };
});
