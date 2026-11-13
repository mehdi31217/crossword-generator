/**
 * Rate limiter — uses Redis when available, in-memory fallback otherwise.
 *
 * With Redis: shared across all server instances via sliding window (horizontal scaling).
 * Without Redis: in-memory per-instance (original behavior).
 *
 * Set REDIS_URL in environment to enable Redis-based rate limiting.
 */

const redis = require('../redis');

// In-memory fallback store
const rateLimitStore = new Map();

function rateLimit({ windowMs = 60_000, maxRequests = 100 } = {}) {
  return async (req, res, next) => {
    const ip = req.ip || req.connection?.remoteAddress || 'unknown';
    const key = `rl:${ip}:${encodeURIComponent(req.path)}`;

    try {
      if (redis.connected) {
        const result = await redis.checkRateLimit(key, maxRequests, windowMs);
        if (!result.allowed) {
          return res.status(429).json({
            error: 'درخواست بیش از حد. لطفاً کمی صبر کنید.',
            retryAfter: Math.ceil(result.resetMs / 1000),
          });
        }
        return next();
      }
    } catch (e) {
      // Redis failed — fall through to in-memory
    }

    // In-memory fallback (synchronous, always works)
    const memKey = `${ip}:${req.path}`;
    const now = Date.now();
    let entry = rateLimitStore.get(memKey);
    if (!entry || now - entry.windowStart > windowMs) {
      entry = { count: 1, windowStart: now };
      rateLimitStore.set(memKey, entry);
      return next();
    }

    entry.count++;
    if (entry.count > maxRequests) {
      return res.status(429).json({ error: 'درخواست بیش از حد. لطفاً کمی صبر کنید.' });
    }
    next();
  };
}

// Cleanup stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore) {
    if (now - entry.windowStart > 120_000) rateLimitStore.delete(key);
  }
}, 300_000);

module.exports = { rateLimit };
