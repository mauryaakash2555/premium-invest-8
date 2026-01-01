/**
 * FILE: scripts/safety/add-file-headers.mjs
 * PURPOSE: Add standardized header comments to JS/JSX files (foundation rebuild task).
 * CATEGORY: scripts/safety
 *
 * SIMPLE EXPLANATION:
 * This script goes through our code files and adds a helpful header at the top.
 * The header explains what the file is for, in simple words, so future work is easier.
 */

import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

const TARGET_DIRS = ["app", "components", "lib", "config", "scripts"].map((d) => path.join(ROOT, d));
const EXT_OK = new Set([".js", ".jsx", ".mjs"]);

function listFiles(dir) {
  const out = [];
  const stack = [dir];
  while (stack.length) {
    const cur = stack.pop();
    if (!fs.existsSync(cur)) continue;
    const st = fs.statSync(cur);
    if (st.isFile()) {
      out.push(cur);
      continue;
    }
    if (!st.isDirectory()) continue;
    for (const name of fs.readdirSync(cur)) {
      if (name === "node_modules" || name === ".next" || name === ".git") continue;
      if (name === "DELETE_ME") continue;
      stack.push(path.join(cur, name));
    }
  }
  return out;
}

function categoryFromRel(rel) {
  const r = rel.replace(/\\/g, "/");
  if (r.startsWith("app/api/")) return "api";
  if (r.startsWith("app/")) return "app";
  if (r.startsWith("components/admin/")) return "admin";
  if (r.startsWith("components/user/")) return "user";
  if (r.startsWith("components/shared/")) return "shared";
  if (r.startsWith("components/")) return "components";
  if (r.startsWith("lib/ai/")) return "lib/ai";
  if (r.startsWith("lib/db/")) return "lib/db";
  if (r.startsWith("lib/utils/")) return "lib/utils";
  if (r.startsWith("lib/")) return "lib";
  if (r.startsWith("config/")) return "config";
  if (r.startsWith("scripts/")) return "scripts";
  return "other";
}

function findDeps(src) {
  const deps = new Set();
  const re = /from\s+['\"]([^'\"]+)['\"]/g;
  let m;
  while ((m = re.exec(src))) deps.add(m[1]);
  return Array.from(deps);
}

function hasHeader(src) {
  const head = src.slice(0, 220);
  return head.includes("* FILE:") && head.includes("PURPOSE:");
}

function buildHeader({ rel, category, deps }) {
  const depLines =
    deps.length === 0
      ? " * - (none)\n"
      : deps.slice(0, 12).map((d) => ` * - ${d}\n`).join("") + (deps.length > 12 ? " * - (more...)\n" : "");

  return (
    "/**\n" +
    ` * FILE: ${rel.replace(/\\\\/g, "/")}\n` +
    " * PURPOSE: (auto-added) Explain what this file does.\n" +
    ` * CATEGORY: ${category}\n` +
    " *\n" +
    " * DEPENDENCIES:\n" +
    depLines +
    " *\n" +
    " * USED BY:\n" +
    " * - (search the repo for this filename)\n" +
    " *\n" +
    " * SIMPLE EXPLANATION:\n" +
    " * This file is part of the app.\n" +
    " * It helps one specific feature work correctly.\n" +
    " *\n" +
    " * TO MODIFY:\n" +
    " * - 🔧 Search for \"TO MODIFY\" notes inside the file.\n" +
    " */\n\n"
  );
}

let changed = 0;
for (const base of TARGET_DIRS) {
  const files = listFiles(base);
  for (const abs of files) {
    const ext = path.extname(abs);
    if (!EXT_OK.has(ext)) continue;
    const rel = path.relative(ROOT, abs);

    const src = fs.readFileSync(abs, "utf8");
    if (hasHeader(src)) continue;

    const category = categoryFromRel(rel);
    const deps = findDeps(src);
    const header = buildHeader({ rel, category, deps });

    fs.writeFileSync(abs, header + src, "utf8");
    changed += 1;
  }
}

console.log(`[add-file-headers] added headers to ${changed} files`);
