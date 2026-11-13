import http from 'http';
import express from 'express';
import { createRequire } from 'module';
import { createServer as createViteServer } from 'vite';

import fs from 'fs';

// Force SQLite mode in this environment
process.env.DB_TYPE = process.env.DB_TYPE || 'sqlite';

const require = createRequire(import.meta.url);
const { createApp } = require('./server/index.js');

function patchViteClient() {
  try {
    const clientPath = './node_modules/vite/dist/client/client.mjs';
    if (fs.existsSync(clientPath)) {
      let code = fs.readFileSync(clientPath, 'utf8');
      let changed = false;
      if (code.includes('reject(new Error("WebSocket closed without opened."));')) {
        code = code.replace('reject(new Error("WebSocket closed without opened."));', 'resolve();');
        changed = true;
      }
      if (code.includes('[vite] failed to connect to websocket')) {
        code = code.replace(/console\.error\(\s*`\[vite\] failed to connect to websocket[\s\S]*?`\s*\);?/g, '/* silenced */');
        changed = true;
      }
      if (changed) {
        fs.writeFileSync(clientPath, code, 'utf8');
      }
    }
  } catch (err) {
    // Non-fatal
  }
}
patchViteClient();

async function start() {
  const rootApp = express();
  const httpServer = http.createServer(rootApp);

  // Initialize backend Express app + WebSocket server attached to httpServer
  const { app: backendApp } = await createApp(httpServer);

  // Initialize Vite middleware in development mode
  const vite = await createViteServer({
    server: {
      middlewareMode: true,
      hmr: false,
      ws: false,
      watch: null,
    },
    appType: 'spa',
  });

  // Route backend API requests (excluding frontend source files like /api/client.ts) to backendApp
  rootApp.use((req, res, next) => {
    const url = req.url || '';
    const isSourceFile = /\.(tsx?|jsx?|mjs|css|map)(\?.*)?$/.test(url);
    if (!isSourceFile && (url.startsWith('/api/') || url === '/api' || url.startsWith('/healthz') || url.startsWith('/readyz'))) {
      return backendApp(req, res, next);
    }
    return vite.middlewares(req, res, next);
  });

  const PORT = 3000;
  let retries = 0;

  httpServer.on('error', (err) => {
    if (err.code === 'EADDRINUSE' && retries < 10) {
      retries += 1;
      setTimeout(() => {
        httpServer.close();
        httpServer.listen(PORT, '0.0.0.0');
      }, 300);
    } else {
      console.error('❌ Server error:', err);
      process.exit(1);
    }
  });

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Unified Server (Express API + WS + Vite Frontend) running on http://0.0.0.0:${PORT}`);
  });

  const shutdown = () => {
    httpServer.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 500).unref();
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

start().catch((err) => {
  console.error('❌ Failed to start unified server:', err);
  process.exit(1);
});
