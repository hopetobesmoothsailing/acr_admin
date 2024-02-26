import path from 'path';
import { defineConfig } from 'vite';
import { createProxyMiddleware } from 'http-proxy-middleware';
import react from '@vitejs/plugin-react-swc';
import checker from 'vite-plugin-checker';
import fs from 'fs';

// ----------------------------------------------------------------------

export default defineConfig({
  esbuild: {
    loader: 'jsx',
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
  plugins: [
    react(),
    checker({
      eslint: {
        lintCommand: 'eslint "./src/**/*.{js,jsx,ts,tsx}"',
      },
    }),
  ],
  resolve: {
    alias: [
      {
        find: /^~(.+)/,
        replacement: path.join(process.cwd(), 'node_modules/$1'),
      },
      {
        find: /^src(.+)/,
        replacement: path.join(process.cwd(), 'src/$1'),
      },
    ],
  },
  server: {

    host: '0.0.0.0',
    port: 3030,
  },
  preview: {
    port: 3030,
  },
});
