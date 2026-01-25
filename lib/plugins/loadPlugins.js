/**
 * Plugin loader (idempotent)
 * Keeps plugin registration out of core files.
 */

let loaded = false;

export async function loadPlugins() {
  if (loaded) return;
  loaded = true;
  try {
    // Import side-effects: plugin files should call registerPlugin(...)
    await import("@/features/plugins/index.js");
  } catch {
    // No plugins configured (fine).
  }
}






