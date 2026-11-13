/**
 * JWT-based stateless authentication.
 *
 * Replaces the old in-memory Map with JSON Web Tokens.
 * Stateless → no server RAM used, works across multiple instances (horizontal scaling).
 *
 * Environment:
 *   JWT_SECRET     — signing key (auto-generated if missing, but SET IT in production)
 *   JWT_EXPIRY     — token lifetime in ms (default: 24h)
 *
 * The public API (createSession, validateToken, invalidateToken) is unchanged
 * so all existing code works without modification.
 */

const logger = require('../utils/logger');
const jwt = require('jsonwebtoken');

// ─── Secret ────────────────────────────────────────────────

// In production, ALWAYS set JWT_SECRET in environment!
const SECRET = process.env.JWT_SECRET || (function () {
  const fs = require('fs');
  const path = require('path');
  const secretFile = path.join(__dirname, '..', '.jwt_secret');
  try {
    if (fs.existsSync(secretFile)) {
      return fs.readFileSync(secretFile, 'utf8').trim();
    }
  } catch (e) { /* ignore */ }
  // Generate a deterministic-but-unique default (WARN in production)
  const crypto = require('crypto');
  const generated = crypto.randomBytes(64).toString('hex');
  try {
    fs.writeFileSync(secretFile, generated, 'utf8');
    logger.info(`[auth] JWT secret auto-generated → ${secretFile}`);
  } catch (e) { /* ignore */ }
  return generated;
})();

// Refuse to boot in production without an explicit secret. The on-disk
// fallback lives on one machine, so behind a load balancer every node would
// sign/verify with a different key and users would be logged out at random.
if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
  logger.error('[auth] JWT_SECRET is not set. Set it before starting in production.');
  throw new Error('JWT_SECRET must be set when NODE_ENV=production');
}

const EXPIRY_MS = parseInt(process.env.JWT_EXPIRY || String(24 * 60 * 60 * 1000)); // 24h default

// ─── Public API (matches old sessionAuth interface) ────────

function createSession(userId) {
  if (!userId) throw new Error('userId required for createSession');
  const payload = { userId };
  const token = jwt.sign(payload, SECRET, {
    expiresIn: Math.floor(EXPIRY_MS / 1000), // jwt expects seconds
    algorithm: 'HS256',
  });
  return token;
}

function validateToken(token) {
  if (!token || typeof token !== 'string') return null;
  try {
    const decoded = jwt.verify(token, SECRET, { algorithms: ['HS256'] });
    return decoded.userId || null;
  } catch (e) {
    // Token expired, malformed, or wrong secret
    return null;
  }
}

function invalidateToken(token) {
  // JWT is stateless — tokens self-expire after JWT_EXPIRY ms.
  // For instant invalidation (e.g. password change), add a Redis blocklist.
  // For now, client-side removal + short expiry is sufficient.
  // logger.info('[auth] Token invalidated (stateless — relies on expiry)');
}

// ─── Express middleware ────────────────────────────────────

function requireAuth(req, res, next) {
  // Public endpoints that don't need auth (exact path match)
  const publicPaths = new Set([
    '/healthz', '/readyz',
    '/api/health', '/api/login',
    '/api/dictionary', '/api/dictionary/stats',
    '/api/glue-dictionary', '/api/story/books', '/api/leaderboard',
  ]);
  // Also match sub-paths for these prefixes (e.g. /api/notifications/xxx)
  const publicPrefixes = [
    '/api/room',
    '/api/player-left',
    '/api/matchmaking',
    // Retention telemetry: a guest who never logs in is exactly the drop-off
    // worth measuring, so this must accept anonymous calls (identity is attached
    // when a token happens to be present).
    '/api/events',
  ];
  if (publicPaths.has(req.path)) return next();
  if (publicPrefixes.some(p => req.path.startsWith(p))) {
    // Public endpoints stay open (guests must be able to play), but if a valid
    // token is present we still attach the identity so handlers can bind actions
    // to the authenticated user and reject impersonation.
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const userId = validateToken(authHeader.split(' ')[1]);
      if (userId) {
        req.userId = userId;
        req.token = authHeader.split(' ')[1];
      }
    }
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'توکن ارسال نشده' });
  }

  const token = authHeader.split(' ')[1];
  const userId = validateToken(token);
  if (!userId) {
    return res.status(401).json({ error: 'توکن نامعتبر یا منقضی شده' });
  }

  req.userId = userId;
  req.token = token;
  next();
}

module.exports = { createSession, validateToken, invalidateToken, requireAuth };
