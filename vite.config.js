import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    envPrefix: ['VITE_', 'COLLEGE_', 'SUPABASE_'],
    define: {
      'import.meta.env.COLLEGE_NAME': JSON.stringify(env.COLLEGE_NAME || ''),
      'import.meta.env.COLLEGE_PHONE': JSON.stringify(env.COLLEGE_PHONE || ''),
      'import.meta.env.COLLEGE_ADDRESS': JSON.stringify(env.COLLEGE_ADDRESS || ''),
      'import.meta.env.SUPABASE_URL': JSON.stringify(env.SUPABASE_URL || ''),
      'import.meta.env.SUPABASE_ANON_KEY': JSON.stringify(env.SUPABASE_ANON_KEY || '')
    },
    server: {
      port: 3000,
      strictPort: false,
      host: true
    },
    build: {
      chunkSizeWarningLimit: 800,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            supabase: ['@supabase/supabase-js'],
            icons: ['lucide-react']
          }
        }
      }
    }
  };
});
