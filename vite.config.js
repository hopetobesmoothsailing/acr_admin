import path from 'path';
import { defineConfig } from 'vite';
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
    https: {
      key: fs.readFileSync('./../privkey.pem'),
      cert: fs.readFileSync('./../fullchain.pem'),
     },
     middlewareMode: true,
     // Define the custom middleware function
     middleware: (connect, options) => {
       return (req, res, next) => {
         // Check if the request is not secure (HTTP)
         if (!req.secure) {
           // Redirect to HTTPS
           const httpsUrl = `https://${req.headers.host}${req.url}`;
           return res.writeHead(301, { Location: httpsUrl }).end();
         }
         // Call the next middleware in the chain
         next();
       };
     },
    host: '0.0.0.0',
    port: 3030,
  },
  preview: {
    port: 3030,
  },
});
