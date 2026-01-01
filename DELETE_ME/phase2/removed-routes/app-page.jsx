/**
 * FILE: app/page.jsx
 * PURPOSE: Root homepage entry (delegates to the public route group).
 * CATEGORY: app
 *
 * SIMPLE EXPLANATION:
 * Next.js uses `app/page.jsx` as the homepage route.
 * During the foundation rebuild, the real homepage lives in `app/(public)/page.jsx`.
 */

export { default } from "./(public)/page";
