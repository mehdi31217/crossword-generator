/**
 * PM2 Ecosystem Config — Cluster Mode for Production
 *
 * Usage:
 *   pm2 start ecosystem.config.cjs          # Start cluster
 *   pm2 restart ecosystem.config.cjs        # Restart
 *   pm2 stop ecosystem.config.cjs           # Stop
 *   pm2 logs crossword-server              # View logs
 *   pm2 monit                              # Monitor
 *
 * Zero-downtime reload:
 *   pm2 reload ecosystem.config.cjs
 *
 * WHY `.cjs` and not `.js`:
 *   The root package.json declares "type": "module", so any `.js` file here is
 *   parsed as ESM. PM2 loads this file with require(), and CommonJS syntax
 *   (`module.exports`) inside an ESM-parsed file silently produces an empty
 *   config — PM2 then starts nothing. The `.cjs` extension forces CommonJS
 *   regardless of package.json, so do NOT rename it back to `.js`.
 */
// Load real credentials from server/.env (git-ignored) instead of hardcoding
// them here — this file IS tracked by git, so no secret may live in it.
//
// Deliberately hand-rolled rather than `require('dotenv')`: PM2 resolves this
// file from the project root, where dotenv is NOT installed (it lives in
// server/node_modules), so requiring it would crash `pm2 start`.
const fs = require('fs');
const path = require('path');

function readEnvFile(file) {
  const out = {};
  try {
    const text = fs.readFileSync(file, 'utf8');
    for (const line of text.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let value = trimmed.slice(eq + 1).trim();
      if ((value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      if (key) out[key] = value;
    }
  } catch (e) { /* no .env — fall back to the real process environment */ }
  return out;
}

// Path is anchored to this file (not process.cwd()) so it works from anywhere.
const fileEnv = readEnvFile(path.join(__dirname, 'server', '.env'));
const envValue = (key) => process.env[key] || fileEnv[key] || '';

/**
 * Only set a variable when we actually have a value for it.
 * An empty string is NOT the same as "unset": PM2 would inject `FOO=''` into
 * the worker, and dotenv (which the server runs at startup) refuses to
 * overwrite an existing key — so the empty value would win and break the
 * connection. Omitting the key lets the server's own .env load fill it in.
 */
function withValues(base) {
  const out = { ...base };
  for (const key of ['DATABASE_URL', 'REDIS_URL', 'JWT_SECRET']) {
    const value = envValue(key);
    if (value) out[key] = value;
  }
  return out;
}

/**
 * Scaling notes
 * -------------
 * All live game state that two different workers must agree on now lives in
 * Redis, so running more than one worker is safe:
 *   • room registry (challenge / arena rooms)  → Redis key  room:reg:<id>
 *   • per-user direct messages (challenges, matchmaking + arena notifications)
 *     → Redis pub/sub on `ws:direct`, with a presence mirror on `ws:presence`
 *   • room broadcasts                          → Redis pub/sub on `ws:room:…`
 *   • channel membership / presence lists      → Redis pub/sub on `ws:chanpresence`
 *   • matchmaking + arena queues               → Redis (already)
 *   • sessions                                 → stateless JWT (no sticky sessions)
 *
 * Notifications are persisted in Postgres, so anything queued in memory is only
 * an instant-delivery cache — nothing is lost if a worker restarts.
 *
 * Default is still 1 worker: a single Node process handles tens of thousands of
 * concurrent WebSocket connections, so scale UP (bigger box) before you scale
 * OUT. Raise it with PM2_INSTANCES=<n> (or `pm2 scale`) when one core is the
 * actual bottleneck.
 */
const INSTANCES = parseInt(process.env.PM2_INSTANCES || '1', 10);

module.exports = {
  apps: [{
    name: 'crossword-server',
    script: './index.js',
    cwd: './server',

    // Cluster mode; single worker by default (see note above).
    // Scale out with PM2_INSTANCES=<n> once one core is the bottleneck.
    exec_mode: 'cluster',
    instances: INSTANCES,

    // Environment variables — values come from server/.env, never from git.
    // Secrets are only injected when a real value exists (see withValues).
    env: withValues({
      NODE_ENV: 'development',
      PORT: 8081,
      DB_TYPE: process.env.DB_TYPE || 'auto',
    }),
    env_production: withValues({
      NODE_ENV: 'production',
      PORT: 8081,
      DB_TYPE: 'postgres',
      // MUST be a long random string in production. The server refuses to boot
      // without it when NODE_ENV=production (see server/index.js).
      RATE_LIMIT: '300',
      PG_POOL_MAX: '20',
    }),

    // Restart behavior
    max_restarts: 10,
    restart_delay: 2000,
    min_uptime: '10s',

    // Logging
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    combine_logs: true,
    merge_logs: true,

    // Shutdown
    kill_timeout: 5000,
    listen_timeout: 3000,
    shutdown_with_message: true,

    // Health
    max_memory_restart: '1G',
  }],
};
