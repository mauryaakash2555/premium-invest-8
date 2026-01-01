/**
 * FILE: lib/utils/logger.js
 * PURPOSE: Tiny logging wrapper.
 * CATEGORY: lib
 *
 * SIMPLE EXPLANATION:
 * This keeps logs consistent. In the future we can swap it for a real logger.
 */

export const logger = {
  info: (...args) => console.log(...args),
  warn: (...args) => console.warn(...args),
  error: (...args) => console.error(...args),
};
