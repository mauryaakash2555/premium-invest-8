/**
 * Plugin Manager
 * Add new features without touching core code.
 *
 * Plugin structure:
 * {
 *   name: 'MyFeature',
 *   onChatMessage: async ({ message, leadId, mode }) => { },
 *   onChatReply: async ({ reply, provider, leadId, mode }) => { },
 *   onLeadCapture: async ({ lead }) => { },
 *   onAdminLoad: async ({ at }) => { }
 * }
 */

const plugins = [];

export function registerPlugin(plugin) {
  if (!plugin || typeof plugin !== "object") return;
  if (!plugin.name) return;
  plugins.push(plugin);
}

export async function runPluginHook(hookName, data) {
  for (const plugin of plugins) {
    const fn = plugin?.[hookName];
    if (typeof fn !== "function") continue;
    try {
      // eslint-disable-next-line no-await-in-loop
      await fn(data);
    } catch {
      // ignore
    }
  }
}


