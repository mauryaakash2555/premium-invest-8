/**
 * Safely remove a feature (non-destructive by default).
 * Run: node scripts/build/remove-feature.js FeatureName
 *
 * Default behavior:
 * - Moves matched files into DELETE_ME/phase3/removed-features/<FeatureName>/
 * - Does NOT delete anything (easy rollback)
 *
 * Optional:
 * - Pass --force-delete to actually delete after moving (NOT recommended)
 */

const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");

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

async function safeMove(src, dst) {
  await fsp.mkdir(path.dirname(dst), { recursive: true });
  await fsp.rename(src, dst);
}

async function main() {
  const args = process.argv.slice(2);
  const nameRaw = (args[0] || "").trim();
  const forceDelete = args.includes("--force-delete");
  if (!nameRaw) {
    console.error("Usage: node scripts/build/remove-feature.js FeatureName [--force-delete]");
    process.exit(2);
  }
  const name = nameRaw.replace(/[^\w]/g, "");
  const root = repoRoot();

  const candidates = [
    path.join(root, "features", "plugins", `${name}.js`),
    path.join(root, "components", "user", `${name}.jsx`),
    path.join(root, "components", "admin", `${name}.jsx`),
    path.join(root, "components", "shared", `${name}.jsx`),
    path.join(root, "lib", "ai", `${name.toLowerCase()}.js`),
    path.join(root, "lib", "db", `${name.toLowerCase()}.js`),
    path.join(root, "app", "api", name.toLowerCase(), "route.js"),
  ];

  const toMove = [];
  for (const p of candidates) {
    if (await exists(p)) toMove.push(p);
  }

  if (!toMove.length) {
    console.log("No files found for:", name);
    return;
  }

  console.log("Files to remove:");
  for (const p of toMove) console.log(" -", path.relative(root, p));

  const destBase = path.join(root, "DELETE_ME", "phase3", "removed-features", name);

  for (const p of toMove) {
    const rel = path.relative(root, p);
    const dest = path.join(destBase, rel);
    await safeMove(p, dest);
    console.log("Moved:", rel, "->", path.relative(root, dest));
  }

  if (forceDelete) {
    await fsp.rm(destBase, { recursive: true, force: true });
    console.log("Deleted:", path.relative(root, destBase));
  } else {
    console.log("Done (non-destructive). Update docs/imports manually.");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});





