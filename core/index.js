/**
 * 🔒 CORE PROTECTED MODULE - MAIN INDEX
 * 
 * This is the main export for all core protected modules.
 * 
 * Usage:
 *   import MarketTicker from '@/core/marketTicker'
 *   import { AdminLogin, ... } from '@/core/admin'
 *   import { ChatButton, ... } from '@/core/chat'
 */

// Re-export all core modules
export { default as MarketTicker } from './marketTicker';
export * from './admin';
export * from './chat';
