import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteSingleFile } from 'vite-plugin-singlefile';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(here, '..');

/**
 * Two build modes.
 *
 *  default      -> dist/            normal multi-file build, talks to the API
 *  standalone   -> dist-standalone/ everything inlined into one .html file,
 *                                   runs offline from the bundled data layer
 *
 * `@shared` points at the folder the server also imports, so the case data,
 * the taxonomy and the scoring rules have exactly one definition.
 */
export default defineConfig(({ mode }) => {
  const standalone = mode === 'standalone';
  return {
    // Relative asset paths, so the built site works wherever it is put: a
    // domain root, a GitHub Pages subfolder (user.github.io/repo/), a
    // subdirectory of a college server, or even opened straight off disk.
    // With a leading-slash base, a subfolder deploy loads a blank page.
    base: './',
    plugins: [react(), ...(standalone ? [viteSingleFile()] : [])],
    resolve: {
      alias: { '@shared': path.resolve(projectRoot, 'shared') }
    },
    server: {
      port: 5173,
      open: false,
      fs: { allow: [projectRoot] },
      // The dev server proxies the API so the browser sees one origin and
      // there is no CORS to think about during development.
      proxy: {
        '/api': { target: 'http://localhost:4000', changeOrigin: true }
      }
    },
    build: {
      outDir: standalone ? 'dist-standalone' : 'dist',
      emptyOutDir: true,
      sourcemap: false,
      ...(standalone
        ? { assetsInlineLimit: 100_000_000, cssCodeSplit: false, chunkSizeWarningLimit: 8000 }
        : {})
    },
    define: {
      __STANDALONE__: JSON.stringify(standalone)
    }
  };
});
