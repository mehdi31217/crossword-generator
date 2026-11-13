/**
 * Structured Logger (pino)
 *
 * Usage:
 *   const logger = require('./utils/logger');
 *   logger.info('Server started on port ' + port);
 *   logger.error({ err }, 'Failed to connect');
 *   logger.warn('High memory usage: %d MB', mem);
 *
 * Log level controlled by LOG_LEVEL env var (default: 'info').
 * Set to 'debug' for verbose output, 'error' for silent mode.
 *
 * In production, pino outputs JSON (pipe to log shipper).
 * In development, pino-pretty formats output with colors.
 */
const pino = require('pino');

const isProduction = process.env.NODE_ENV === 'production';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  ...(isProduction
    ? {}
    : {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:HH:MM:ss.l',
            ignore: 'pid,hostname',
          },
        },
      }),
  redact: {
    paths: ['req.headers.authorization', 'req.body.token', 'player.token'],
    censor: '[REDACTED]',
  },
});

module.exports = logger;
