import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { copyFileSync, existsSync, mkdirSync } from 'fs';
import { buildSync } from 'esbuild';

// Custom plugin to handle Chrome MV3 packaging and build self-contained content & background scripts
function extensionPlugin() {
  return {
    name: 'extension-builder',
    transformIndexHtml(html: string) {
      // Remove crossorigin attributes and modulepreload links to eliminate MV3 warnings
      return html
        .replace(/<link rel="modulepreload"[^>]*>/g, '')
        .replace(/\scrossorigin(="[^"]*")?/g, '');
    },
    closeBundle() {
      // Ensure dist exists
      if (!existsSync('dist')) {
        mkdirSync('dist', { recursive: true });
      }

      // 1. Bundle content.ts into a 100% self-contained IIFE script (NO external ES imports)
      buildSync({
        entryPoints: [resolve(__dirname, 'src/content/index.ts')],
        bundle: true,
        format: 'iife',
        outfile: resolve(__dirname, 'dist/content.js'),
        target: 'es2020',
        minify: true,
      });

      // 2. Bundle background.ts into a 100% self-contained service worker
      buildSync({
        entryPoints: [resolve(__dirname, 'src/background/index.ts')],
        bundle: true,
        format: 'esm',
        outfile: resolve(__dirname, 'dist/background.js'),
        target: 'es2020',
        minify: true,
      });

      // 3. Copy manifest.json
      if (existsSync('manifest.json')) {
        copyFileSync('manifest.json', 'dist/manifest.json');
      }

      // 4. Copy icons
      if (existsSync('public/icons')) {
        if (!existsSync('dist/icons')) {
          mkdirSync('dist/icons', { recursive: true });
        }
        ['icon-16.png', 'icon-32.png', 'icon-48.png', 'icon-128.png', 'icon.svg'].forEach((file) => {
          const src = resolve(__dirname, 'public/icons', file);
          if (existsSync(src)) {
            copyFileSync(src, resolve(__dirname, 'dist/icons', file));
          }
        });
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), extensionPlugin()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    modulePreload: false, // Disables modulepreload link injection
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'popup.html'),
        dashboard: resolve(__dirname, 'dashboard.html'),
      },
      output: {
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
