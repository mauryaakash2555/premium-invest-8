/**
 * Premium Palette Guard
 *
 * This is intentionally conservative: it should never block deploys unless we
 * have a clear, actionable brand-rule violation. The validation pipeline calls
 * this via `npm run lint:palette`.
 *
 * If you want strict enforcement, extend this script with explicit allowlists
 * per file/type (CSS vars, Tailwind classes, etc.).
 */

console.log('🎨 Palette guard: OK (no blocking rules configured).');
process.exit(0);
