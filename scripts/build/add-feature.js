/**
 * Interactive script to add new feature scaffold
 * Run: node scripts/build/add-feature.js
 */

const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");
const readline = require("readline/promises");

function repoRoot() {
  return path.resolve(__dirname, "../..");
}

async function exists(p) {
  try {
    await fsp.access(p, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  try {
    const nameRaw = (await rl.question("Feature name (e.g. EmailNotifications): ")).trim();
    if (!nameRaw) throw new Error("Feature name required");
    const name = nameRaw.replace(/[^\w]/g, "");

    const kind = (await rl.question("Type (user/admin/shared/plugin) [plugin]: ")).trim().toLowerCase() || "plugin";
    const needsApi = (await rl.question("Needs API route? (y/N): ")).trim().toLowerCase() === "y";
    const needsDb = (await rl.question("Needs DB module? (y/N): ")).trim().toLowerCase() === "y";

    const root = repoRoot();

    const componentTpl = await fsp.readFile(path.join(root, "templates", "Component.template.jsx"), "utf8");
    const apiTpl = await fsp.readFile(path.join(root, "templates", "APIRoute.template.js"), "utf8");

    if (kind === "plugin") {
      const pluginPath = path.join(root, "features", "plugins", `${name}.js`);
      if (!(await exists(pluginPath))) {
        const content =
          `/**\n` +
          ` * ${name} Plugin\n` +
          ` */\n\n` +
          `import { registerPlugin } from \"@/lib/plugins/PluginManager\";\n\n` +
          `registerPlugin({\n` +
          `  name: \"${name}\",\n` +
          `  async onLeadCapture({ lead }) {\n` +
          `    // TODO\n` +
          `    void lead;\n` +
          `  },\n` +
          `});\n`;
        await fsp.mkdir(path.dirname(pluginPath), { recursive: true });
        await fsp.writeFile(pluginPath, content, "utf8");
        console.log("Created:", pluginPath);
      } else {
        console.log("Exists:", pluginPath);
      }
    } else {
      const dir = kind === "admin" ? "components/admin" : kind === "shared" ? "components/shared" : "components/user";
      const componentPath = path.join(root, dir, `${name}.jsx`);
      if (!(await exists(componentPath))) {
        const content = componentTpl.replace(/\[COMPONENT_NAME\]/g, name).replace("[DESCRIPTION]", `${name} feature`);
        await fsp.mkdir(path.dirname(componentPath), { recursive: true });
        await fsp.writeFile(componentPath, content, "utf8");
        console.log("Created:", componentPath);
      } else {
        console.log("Exists:", componentPath);
      }
    }

    if (needsApi) {
      const routeDir = path.join(root, "app", "api", name.toLowerCase());
      const routePath = path.join(routeDir, "route.js");
      if (!(await exists(routePath))) {
        const content = apiTpl.replace(/\[ROUTE_NAME\]/g, name.toLowerCase()).replace("[DESCRIPTION]", `${name} API route`);
        await fsp.mkdir(routeDir, { recursive: true });
        await fsp.writeFile(routePath, content, "utf8");
        console.log("Created:", routePath);
      } else {
        console.log("Exists:", routePath);
      }
    }

    if (needsDb) {
      const dbPath = path.join(root, "lib", "db", `${name.toLowerCase()}.js`);
      if (!(await exists(dbPath))) {
        const content =
          `/**\n` +
          ` * ${name} DB Module\n` +
          ` */\n\n` +
          `import { supabaseAdmin } from \"@/lib/supabaseAdmin\";\n\n` +
          `export const ${name}DB = {\n` +
          `  async ping() {\n` +
          `    const sb = supabaseAdmin();\n` +
          `    void sb;\n` +
          `    return { ok: true };\n` +
          `  },\n` +
          `};\n`;
        await fsp.mkdir(path.dirname(dbPath), { recursive: true });
        await fsp.writeFile(dbPath, content, "utf8");
        console.log("Created:", dbPath);
      } else {
        console.log("Exists:", dbPath);
      }
    }

    // Append doc entry (best-effort)
    const featuresMd = path.join(root, "features", "FEATURES.md");
    if (await exists(featuresMd)) {
      await fsp.appendFile(
        featuresMd,
        `\n---\n\n## Feature: ${name}\n**Status:** New (scaffold)\n**Files:**\n- (fill in)\n\n**To disable:** Add a flag in config/features.js\n**To remove:** Delete files listed above\n`,
        "utf8"
      );
      console.log("Updated:", featuresMd);
    }

    console.log("Done.");
  } finally {
    rl.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});


