/**
 * Centralized Logging
 */

import { logEventSafe } from '@/lib/db/events';

export const Logger = {
  error(message, context = {}) {
    console.error('[ERROR]', message, context);
    try {
      logEventSafe('error', { message, ...context, timestamp: new Date().toISOString() });
    } catch {
      // ignore
    }
  },

  warn(message, context = {}) {
    console.warn('[WARN]', message, context);
    try {
      logEventSafe('warning', { message, ...context, timestamp: new Date().toISOString() });
    } catch {
      // ignore
    }
  },

  info(message, context = {}) {
    console.log('[INFO]', message, context);
  },

  success(message, context = {}) {
    console.log('[SUCCESS]', message, context);
  },
};
