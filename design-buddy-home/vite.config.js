import { defineConfig } from 'vite'
import { resolve } from 'node:path'

// Self-contained config: the app shares the repository-root Vite install
// (node_modules symlink). VITE_ALLOWED_HOST gates the sandbox preview proxy
// host; without it, Vite keeps its default host checking.
export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 5174,
    allowedHosts: [process.env.VITE_ALLOWED_HOST, '.e2b.app'].filter(Boolean),
  },
  preview: {
    host: '0.0.0.0',
    port: 5174,
    allowedHosts: [process.env.VITE_ALLOWED_HOST, '.e2b.app'].filter(Boolean),
  },
  build: {
    rollupOptions: {
      input: {
        home: resolve(import.meta.dirname, 'index.html'),
        auth: resolve(import.meta.dirname, 'auth.html'),
        'qiye-app': resolve(import.meta.dirname, 'qiye-app.html'),
        'app-case': resolve(import.meta.dirname, 'app-case.html'),
        apps: resolve(import.meta.dirname, 'apps.html'),
        showcase: resolve(import.meta.dirname, 'showcase.html'),
        'showcase-case': resolve(import.meta.dirname, 'showcase-case.html'),
        templates: resolve(import.meta.dirname, 'templates.html'),
        'art-library': resolve(import.meta.dirname, 'art-library.html'),
        'art-review': resolve(import.meta.dirname, 'art-review.html'),
        themes: resolve(import.meta.dirname, 'themes.html'),
        settings: resolve(import.meta.dirname, 'settings.html'),
        media: resolve(import.meta.dirname, 'media.html'),
        experts: resolve(import.meta.dirname, 'experts.html'),
        skills: resolve(import.meta.dirname, 'skills.html'),
        connectors: resolve(import.meta.dirname, 'connectors.html'),
      },
    },
  },
})
