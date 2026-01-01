/**
 * FILE: scripts\validate-chat.mjs
 * PURPOSE: (auto-added) Explain what this file does.
 * CATEGORY: scripts
 *
 * DEPENDENCIES:
 * - node:fs
 *
 * USED BY:
 * - (search the repo for this filename)
 *
 * SIMPLE EXPLANATION:
 * This file is part of the app.
 * It helps one specific feature work correctly.
 *
 * TO MODIFY:
 * - 🔧 Search for "TO MODIFY" notes inside the file.
 */

﻿import fs from "node:fs";

const files = [
  "components/AIChatFloat.jsx",
  "components/AIChatFloat.module.css",
  "components/WhatsAppFloat.jsx",
  "components/ChatErrorBoundary.jsx",
];

function fail(msg) {
  console.error("CHAT VALIDATION FAILED:", msg);
  process.exit(2);
}

for (const f of files) {
  if (!fs.existsSync(f)) fail(`missing file: ${f}`);
}

const chat = fs.readFileSync("components/AIChatFloat.jsx", "utf8");

// Basic sanity checks
if (!chat.includes("export default function AIChatFloat")) fail("AIChatFloat export missing");
if (!chat.includes("function wantsHuman")) fail("wantsHuman missing");

// Guard against the exact previous break: shouldShow referenced in wantsHuman()
const wantsHumanSplit = chat.split("function wantsHuman");
const wantsHumanBlock = wantsHumanSplit[1] || "";
if (wantsHumanBlock.includes("shouldShow")) fail("wantsHuman() references shouldShow");

// JSX syntax parse check (catches intentionally injected syntax errors)
try {
  const mod = await import("next/dist/compiled/babel/parser.js");
  const parse = mod?.default?.parse || mod?.parse;
  if (typeof parse !== "function") throw new Error("parser_missing_parse");

  parse(chat, {
    sourceType: "module",
    plugins: [
      "jsx",
      "importAttributes",
      "classProperties",
      "classPrivateProperties",
      "classPrivateMethods",
      "dynamicImport",
      "optionalChaining",
      "nullishCoalescingOperator",
      "topLevelAwait",
    ],
  });
} catch (e) {
  fail(`AIChatFloat.jsx syntax/parse failed: ${e?.message || e}`);
}

const wa = fs.readFileSync("components/WhatsAppFloat.jsx", "utf8");
if (!wa.includes("<AIChatFloat")) fail("WhatsAppFloat does not render AIChatFloat");
if (!wa.includes("ChatErrorBoundary")) fail("WhatsAppFloat not wrapped in ChatErrorBoundary");

console.log("OK chat validation passed");
process.exit(0);
