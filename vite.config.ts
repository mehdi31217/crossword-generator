import path from 'path';
import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { FRONTEND_PORT } from './utils/config';

/**
 * Dev-only build stamp. A tab left open for weeks keeps executing the bundle it
 * loaded — and because the multiplayer handshake changed since, that tab still
 * joins rooms but broadcasts nothing, leaving its opponent on "waiting" forever
 * (observed live, room_147150). Serving a stamp that changes on every source
 * edit and polling it from the page means such tabs reload themselves.
 */
function buildStampPlugin(): Plugin {
    let stamp = String(Date.now());
    return {
        name: 'cg-build-stamp',
        apply: 'serve',
        configureServer(server) {
            server.watcher.on('change', (file) => {
                const normalized = file.replace(/\\/g, '/');
                if (normalized.includes('/node_modules/') || normalized.includes('/server/')) return;
                if (/\.(tsx?|jsx?|m?js|css|html)$/.test(normalized)) stamp = String(Date.now());
            });
            server.middlewares.use('/__build_stamp', (_req, res) => {
                res.setHeader('Cache-Control', 'no-store');
                res.setHeader('Content-Type', 'text/plain');
                res.end(stamp);
            });
        },
        transformIndexHtml(html) {
            return {
                html,
                tags: [{
                    tag: 'script',
                    children: `(function () {
  var current = null;
  function check() {
    fetch('/__build_stamp', { cache: 'no-store' })
      .then(function (r) { return r.text(); })
      .then(function (s) {
        if (!s) return;
        if (current === null) { current = s; return; }
        if (s !== current) window.location.reload();
      })
      .catch(function () {});
  }
  check();
  setInterval(check, 6000);
})();`,
                    injectTo: 'body',
                }],
            };
        },
    };
}

function disableHmrClientPlugin(): Plugin {
    return {
        name: 'cg-disable-hmr-client',
        enforce: 'pre',
        transform(code, id) {
            if (id.includes('client.mjs') || id.includes('@vite/client')) {
                return code.replace(
                    /const createWebSocketModuleRunnerTransport =[\s\S]*?\n\};\nconst normalizeModuleRunnerTransport/,
                    'const createWebSocketModuleRunnerTransport = () => ({ connect: async () => {}, disconnect: async () => {}, send: async () => {} });\nconst normalizeModuleRunnerTransport'
                );
            }
        },
    };
}

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const isProd = mode === 'production';

    const rollupOptions = {
        output: {
            manualChunks(id: string) {
                // Vendor chunks for better caching
                if (id.includes('node_modules/react-dom') || id.includes('node_modules/react/')) {
                    return 'vendor-react';
                }
                if (id.includes('node_modules/lucide-react')) {
                    return 'vendor-icons';
                }
                if (id.includes('node_modules/')) {
                    return 'vendor-other';
                }
                // Split heavy data modules
                if (id.includes('/data/wordLists') || id.includes('/data/glueWords')) {
                    return 'dictionary-data';
                }
                if (id.includes('/data/campaigns')) {
                    return 'campaigns';
                }
                if (id.includes('/data/shahnamehWords')) {
                    return 'shahnameh';
                }
            },
        },
    };

    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        allowedHosts: true,
        hmr: false,
        ws: false,
        watch: null,
      },
      plugins: [
        disableHmrClientPlugin(),
        react(),
        buildStampPlugin(),
        VitePWA({
          registerType: 'autoUpdate',
          includeAssets: ['icon.svg', 'apple-touch-icon.png', 'pwa-192x192.png', 'pwa-512x512.png'],
          manifest: {
            id: '/',
            name: 'Crossword Gen Pro — گنجینهٔ جدول و شاهنامه',
            short_name: 'گنجینه جدول',
            description: 'بازی جدول کلمات متقاطع با ۵۸ داستان شاهنامه، تاریخ ایران، قصه‌های کهن و اسطوره‌های فوتبال.',
            theme_color: '#8A4224',
            background_color: '#FDF6E7',
            display: 'standalone',
            start_url: '/',
            scope: '/',
            icons: [
              {
                src: '/pwa-192x192.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'any',
              },
              {
                src: '/pwa-512x512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any',
              },
              {
                src: '/pwa-maskable-512x512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'maskable',
              },
            ],
          },
          workbox: {
            maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
            globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff,woff2}'],
          },
          devOptions: {
            enabled: true,
            type: 'module',
          },
        }),
      ],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        target: 'es2020',
        rollupOptions,
        minify: isProd ? 'esbuild' : false,
        sourcemap: !isProd,
      },
    };
});
