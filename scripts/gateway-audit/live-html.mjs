import fs from "node:fs";
import path from "node:path";

function loadProducts() {
  const p = path.resolve(process.cwd(), "data", "store-products.json");
  const raw = fs.readFileSync(p, "utf8");
  const json = JSON.parse(raw);
  if (!Array.isArray(json)) throw new Error("invalid_store_products_json");
  return json;
}

const DEFAULT_MAIN = "https://bmwealth.co.in";
const DEFAULT_STORE = "https://store.bmwealth.co.in";

const MAIN_BASE = String(process.env.AUDIT_MAIN_BASE || DEFAULT_MAIN).replace(/\/$/, "");
const STORE_BASE = String(process.env.AUDIT_STORE_BASE || DEFAULT_STORE).replace(/\/$/, "");

const OUTPUT_DIR = path.resolve(process.cwd(), process.env.AUDIT_OUTPUT_DIR || ".audit");
const OUTPUT_MD = path.join(OUTPUT_DIR, "GATEWAY_AUDIT_REPORT.md");
const OUTPUT_JSON = path.join(OUTPUT_DIR, "GATEWAY_AUDIT_REPORT.json");

/**
 * Forbidden terms list (case-insensitive).
 *
 * Notes:
 * - Some terms are conditional (e.g., Razorpay on bmwealth only).
 * - This is designed to be an *auditor* tool: it will FAIL with evidence.
 */
// IMPORTANT: bmwealth.co.in is allowed to be informational/marketing.
// This audit is about payment-gateway compliance + store-only selling.
const FORBIDDEN = [
  // Main domain must never look like a checkout/payment flow.
  { term: "razorpay", scope: "main-only" },
  { term: "checkout", scope: "main-only" },
  { term: "pay now", scope: "main-only" },
  { term: "buy now", scope: "main-only" },
  { term: "add to cart", scope: "main-only" },

  // Store must avoid finance-advisory positioning (gateway reviewers are strict).
  // NOTE: We intentionally do NOT forbid "SIP" because a product can discuss SIP educationally.
  { term: "mutual fund", scope: "store-only" },
  { term: "portfolio", scope: "store-only" },
  { term: "guaranteed", scope: "store-only" },
  { term: "p.a.", scope: "store-only" },
  { term: "advisory", scope: "store-only" },
  { term: "pms", scope: "store-only" },
  { term: "aum", scope: "store-only" },
  { term: "investment execution", scope: "store-only" },
];

// Required phrases (case-insensitive). These are the most common policy checks.
// If any required phrase is missing on the expected URL, we FAIL with evidence.
const REQUIRED = [
  {
    id: "store-educational-disclaimer",
    scope: "store-only",
    urls: [`${STORE_BASE}/products`],
    pattern: /educational/i,
    message: "Store catalogue must clearly indicate educational content.",
  },
  {
    id: "store-delivery-digital-only",
    scope: "store-only",
    urls: [`${STORE_BASE}/delivery`],
    pattern: /digital/i,
    message: "Delivery policy must clearly state digital-only delivery.",
  },
  {
    id: "store-refund-timeline",
    scope: "store-only",
    urls: [`${STORE_BASE}/refund`],
    // Accept both hyphen and en-dash.
    pattern: /5\s*[\-–]\s*7\s*working\s*days/i,
    message: "Refund policy must include a 5–7 working days timeline.",
  },
];

function isMainUrl(url) {
  try {
    const normalize = (h) => String(h || "").toLowerCase().replace(/:.*$/, "").replace(/^www\./, "");
    const urlHost = normalize(new URL(url).host);
    const mainHost = normalize(new URL(MAIN_BASE).host);
    return urlHost === mainHost;
  } catch {
    return false;
  }
}

function normalizeTermForRegex(term) {
  // Keep it simple and robust: match as substring (case-insensitive).
  // Gateways often do substring checks.
  return term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function regexForRule(rule) {
  if (rule instanceof RegExp) return rule;
  return new RegExp(normalizeTermForRegex(String(rule)), "ig");
}

function findMatchesInHtml(html, ruleOrRegex) {
  const re = regexForRule(ruleOrRegex);
  const lines = html.split(/\r?\n/);
  const matches = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!re.test(line)) continue;

    // Reset lastIndex for safety since we re-use `re`
    re.lastIndex = 0;

    matches.push({
      lineNumber: i + 1,
      line: line.trim().slice(0, 600),
    });

    // Keep evidence short; more is noise.
    if (matches.length >= 3) break;
  }

  return matches;
}

async function fetchHtml(url) {
  const res = await fetch(url, {
    method: "GET",
    redirect: "follow",
    headers: {
      "User-Agent": "BM-Gateway-Audit/1.0 (+https://bmwealth.co.in)",
      Accept: "text/html,application/xhtml+xml",
    },
  });

  const contentType = res.headers.get("content-type") || "";
  const text = await res.text().catch(() => "");

  return {
    url,
    ok: res.ok,
    status: res.status,
    contentType,
    html: text,
  };
}

function buildAuditUrls() {
  const products = loadProducts();
  const productUrls = products.map((p) => `${STORE_BASE}/products/${encodeURIComponent(p.slug)}`);

  return [
    `${MAIN_BASE}/`,
    `${MAIN_BASE}/tools/tax-optimization`,
    `${MAIN_BASE}/services`,
    `${MAIN_BASE}/products`, // must be 404
    `${STORE_BASE}/`,
    `${STORE_BASE}/products`,
    ...productUrls,
    `${STORE_BASE}/terms`,
    `${STORE_BASE}/privacy`,
    `${STORE_BASE}/refund`,
    `${STORE_BASE}/delivery`,
  ];
}

function extractStoreCatalogueSlugs(productsHtml) {
  const html = String(productsHtml || "");
  const re = /href=(?:"|')\/products\/([^"'#?]+)(?:"|')/gi;
  const slugs = new Set();
  let match;

  while ((match = re.exec(html))) {
    const raw = match[1];
    try {
      slugs.add(decodeURIComponent(raw));
    } catch {
      slugs.add(raw);
    }

    if (slugs.size >= 60) break;
  }

  return [...slugs].sort();
}

function expectedStatus(url) {
  // Explicit expectations from the auditor checklist
  if (url === `${MAIN_BASE}/products`) return 404;
  return 200;
}

function shouldCheckTermOnUrl(termEntry, url) {
  if (termEntry.scope === "all") return true;
  if (termEntry.scope === "main-only") return isMainUrl(url);
  if (termEntry.scope === "store-only") return !isMainUrl(url);
  return true;
}

function shouldCheckRequiredOnUrl(reqEntry, url) {
  if (reqEntry.scope === "all") return true;
  if (reqEntry.scope === "main-only") return isMainUrl(url);
  if (reqEntry.scope === "store-only") return !isMainUrl(url);
  return true;
}

function mdEscape(text) {
  return String(text)
    .replaceAll("\\", "\\\\")
    .replaceAll("|", "\\|")
    .replaceAll("\n", " ");
}

function asMdLink(url) {
  return `[${url}](${url})`;
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function summarizeResult(r) {
  const expected = expectedStatus(r.url);
  const statusOk = r.status === expected;

  const violations = [];
  for (const rule of FORBIDDEN) {
    if (!shouldCheckTermOnUrl(rule, r.url)) continue;

    const matches = findMatchesInHtml(r.html || "", rule.term);
    if (matches.length > 0) {
      violations.push({ rule: rule.term, scope: rule.scope, matches });
    }
  }

  const requiredMissing = [];
  for (const req of REQUIRED) {
    if (!shouldCheckRequiredOnUrl(req, r.url)) continue;
    if (!req.urls.includes(r.url)) continue;

    const matches = findMatchesInHtml(r.html || "", req.pattern);
    if (matches.length === 0) {
      requiredMissing.push({ id: req.id, message: req.message, pattern: String(req.pattern) });
    }
  }

  // Enforce canonical store product slug convention on the LIVE catalogue page.
  // This is intentionally strict because gateways review what is *currently* live.
  // Disable temporarily with AUDIT_ALLOW_LEGACY_SLUGS=1.
  if (r.url === `${STORE_BASE}/products` && String(process.env.AUDIT_ALLOW_LEGACY_SLUGS || "").trim() !== "1") {
    const liveSlugs = extractStoreCatalogueSlugs(r.html || "");
    const legacy = liveSlugs.filter((s) => s && !s.endsWith("-pdf"));
    if (legacy.length > 0) {
      requiredMissing.push({
        id: "store-slugs-pdf",
        message: `Store catalogue must use *-pdf slugs. Found legacy slugs: ${legacy.slice(0, 8).join(", ")}${legacy.length > 8 ? " …" : ""}`,
        pattern: "*-pdf slugs",
      });
    }
  }

  // For /products on main domain: we still fetch HTML which may be a 404 page.
  // Treat forbidden-terms as informational in that case (status is what matters).
  const termViolationsRelevant = r.status === 404 && r.url === `${MAIN_BASE}/products` ? [] : violations;

  const pass = statusOk && termViolationsRelevant.length === 0 && requiredMissing.length === 0;

  return {
    ...r,
    expectedStatus: expected,
    statusOk,
    violations: termViolationsRelevant,
    requiredMissing,
    pass,
  };
}

function renderMarkdown(results) {
  const now = new Date().toISOString();

  const lines = [];
  lines.push(`# FINAL AUDIT REPORT (AUTO-GENERATED)\n`);
  lines.push(`Generated: ${now}`);
  lines.push(`Main base: ${MAIN_BASE}`);
  lines.push(`Store base: ${STORE_BASE}\n`);

  lines.push(`## Section 1 — Live HTML Audit (table)\n`);
  lines.push(`This section fetches LIVE HTML (server response), searches forbidden terms, and returns pass/fail with evidence.`);
  lines.push(``);

  lines.push(`| URL | Expected | Status | Result | Evidence |`);
  lines.push(`|---|---:|---:|---|---|`);

  for (const r of results) {
    const status = r.status;
    const expected = r.expectedStatus;
    const result = r.pass ? "PASS" : "FAIL";

    let evidence = "-";
    if (!r.statusOk) {
      evidence = `Expected ${expected}, got ${status}`;
      if (r.hint) evidence = mdEscape(`${evidence}. ${r.hint}`);
    } else if (r.requiredMissing.length > 0) {
      evidence = mdEscape(`Missing required: ${r.requiredMissing[0].message}`);
    } else if (r.violations.length > 0) {
      const v = r.violations[0];
      const m = v.matches[0];
      evidence = `Found \"${v.rule}\" @ line ${m.lineNumber}: ${mdEscape(m.line)}`;
    }

    lines.push(
      `| ${asMdLink(r.url)} | ${expected} | ${status} | ${result} | ${evidence} |`
    );
  }

  lines.push(`\n## Section 2 — User Flow Audit (Playwright)\n`);
  lines.push(`Run: \`npm run audit:gateway:flow\` (or see the HTML report in Playwright output).\n`);

  lines.push(`## Section 3 — Compliance Checklist (checkboxes)\n`);
  const mainViolations = results
    .filter((r) => isMainUrl(r.url))
    .flatMap((r) => r.violations.map((v) => ({ url: r.url, term: v.rule })));

  const hasMainRazorpay = mainViolations.some((v) => v.term.toLowerCase().includes("razorpay"));
  const hasMainCheckout = mainViolations.some((v) => v.term.toLowerCase().includes("checkout"));

  const mainProducts = results.find((r) => r.url === `${MAIN_BASE}/products`);

  const storeProducts = results.find((r) => r.url === `${STORE_BASE}/products`);
  const storeRefund = results.find((r) => r.url === `${STORE_BASE}/refund`);
  const storeDelivery = results.find((r) => r.url === `${STORE_BASE}/delivery`);

  const hasMissing = (entry, id) => {
    const list = entry?.requiredMissing;
    if (!Array.isArray(list) || list.length === 0) return false;
    return list.some((m) => m?.id === id);
  };

  const storeEducationalOk = !!storeProducts && !hasMissing(storeProducts, "store-educational-disclaimer");
  const storeSlugsPdfOk = !!storeProducts && !hasMissing(storeProducts, "store-slugs-pdf");
  const storeRefundTimelineOk = !!storeRefund && !hasMissing(storeRefund, "store-refund-timeline");
  const storeDeliveryDigitalOk = !!storeDelivery && !hasMissing(storeDelivery, "store-delivery-digital-only");

  lines.push(`- [${hasMainRazorpay ? " " : "x"}] bmwealth.co.in has ZERO Razorpay scripts (HTML scan)`);
  lines.push(`- [${hasMainCheckout ? " " : "x"}] bmwealth.co.in has ZERO checkout wording (HTML scan)`);
  lines.push(`- [${mainProducts?.status === 404 ? "x" : " "}] bmwealth.co.in/products returns 404`);
  lines.push(`- [ ] bmwealth.co.in has ZERO "Buy" buttons (manual/Playwright)`);
  lines.push(`- [ ] store.bmwealth.co.in does NOT show advisory language (HTML scan terms list above)`);
  lines.push(`- [${storeEducationalOk ? "x" : " "}] store catalogue indicates educational content (HTML scan)`);
  lines.push(`- [${storeSlugsPdfOk ? "x" : " "}] store catalogue uses *-pdf slugs (HTML scan)`);
  lines.push(`- [${storeDeliveryDigitalOk ? "x" : " "}] delivery policy states digital-only (HTML scan)`);
  lines.push(`- [${storeRefundTimelineOk ? "x" : " "}] refund policy includes 5–7 working days timeline (HTML scan)`);

  lines.push(`\n## Section 4 — Known Risks (if any)\n`);
  if (results.every((r) => r.pass)) {
    lines.push(`- None detected by automated live-HTML scan.`);
  } else {
    const fails = results.filter((r) => !r.pass);
    lines.push(`- ${fails.length} URL(s) failed the live-HTML scan. See Section 1 evidence.`);
  }

  lines.push(`\n## Section 5 — Final Verdict\n`);
  const ready = results.every((r) => r.pass);
  lines.push(`- [${ready ? "x" : " "}] READY for CCAvenue`);
  lines.push(`- [${ready ? "x" : " "}] READY for Razorpay`);

  return lines.join("\n");
}

async function main() {
  ensureDir(OUTPUT_DIR);

  const urls = buildAuditUrls();
  const rawResults = [];

  const maxLiveCataloguePages = Number(process.env.AUDIT_MAX_LIVE_CATALOGUE_PAGES || 20);
  const includeLiveCataloguePages = String(process.env.AUDIT_INCLUDE_LIVE_CATALOGUE_PAGES || "1").trim() !== "0";

  const seenUrls = new Set();
  const pushResult = (r) => {
    if (!r?.url) return;
    if (seenUrls.has(r.url)) return;
    seenUrls.add(r.url);
    rawResults.push(r);
  };

  for (const url of urls) {
    console.log(`[audit] fetching ${url}`);
    try {
      const r = await fetchHtml(url);
      pushResult(r);

      // Save HTML snapshots for evidence
      const safeName = url
        .replace(/^https?:\/\//, "")
        .replaceAll("/", "__")
        .replaceAll("?", "_")
        .replaceAll("#", "_")
        .replace(/[^a-zA-Z0-9_\-.]/g, "_");
      fs.writeFileSync(path.join(OUTPUT_DIR, `${safeName}.html`), r.html || "", "utf8");
    } catch (e) {
      pushResult({
        url,
        ok: false,
        status: 0,
        contentType: "",
        html: "",
        error: String(e?.message || e),
      });
    }
  }

  // Also fetch the LIVE product pages actually listed on the store catalogue.
  // This improves audit realism when deployments lag behind local catalogue changes.
  if (includeLiveCataloguePages) {
    const storeProductsHtml = rawResults.find((r) => r.url === `${STORE_BASE}/products`)?.html;
    const liveCatalogueSlugs = extractStoreCatalogueSlugs(storeProductsHtml);

    const urlsToFetch = liveCatalogueSlugs
      .slice(0, Number.isFinite(maxLiveCataloguePages) ? maxLiveCataloguePages : 20)
      .map((slug) => `${STORE_BASE}/products/${encodeURIComponent(slug)}`)
      .filter((u) => !seenUrls.has(u));

    for (const url of urlsToFetch) {
      console.log(`[audit] fetching (live catalogue) ${url}`);
      try {
        const r = await fetchHtml(url);
        pushResult(r);

        const safeName = url
          .replace(/^https?:\/\//, "")
          .replaceAll("/", "__")
          .replaceAll("?", "_")
          .replaceAll("#", "_")
          .replace(/[^a-zA-Z0-9_\-.]/g, "_");
        fs.writeFileSync(path.join(OUTPUT_DIR, `${safeName}.html`), r.html || "", "utf8");
      } catch (e) {
        pushResult({
          url,
          ok: false,
          status: 0,
          contentType: "",
          html: "",
          error: String(e?.message || e),
        });
      }
    }
  }

  const results = rawResults.map(summarizeResult);

  // Provide better diagnostics for 404 store product pages.
  // When middleware is working, the response will often include X-Matched-Path for /store/products/[slug],
  // meaning the route exists but the slug wasn't found in the deployed catalogue.
  const storeProductsHtml = rawResults.find((r) => r.url === `${STORE_BASE}/products`)?.html;
  const liveCatalogueSlugs = extractStoreCatalogueSlugs(storeProductsHtml);

  for (const r of results) {
    if (!r.url.startsWith(`${STORE_BASE}/products/`)) continue;
    if (r.status !== 404) continue;
    if (liveCatalogueSlugs.length === 0) continue;

    const slug = decodeURIComponent(r.url.slice(`${STORE_BASE}/products/`.length));
    if (liveCatalogueSlugs.includes(slug)) continue;

    const withoutPdf = slug.endsWith("-pdf") ? slug.slice(0, -4) : null;
    if (withoutPdf && liveCatalogueSlugs.includes(withoutPdf)) {
      r.hint = `Slug not in live catalogue. Legacy slug exists: "${withoutPdf}". Deploy the updated catalogue (data/store-products.json) to publish the new *-pdf slugs.`;
      continue;
    }

    r.hint = `Slug not in live catalogue (deployment likely behind). Live catalogue slugs include: ${liveCatalogueSlugs.slice(0, 12).join(", ")}${liveCatalogueSlugs.length > 12 ? " …" : ""}`;
  }

  fs.writeFileSync(OUTPUT_JSON, JSON.stringify({
    generatedAt: new Date().toISOString(),
    mainBase: MAIN_BASE,
    storeBase: STORE_BASE,
    forbidden: FORBIDDEN,
    results,
  }, null, 2));

  fs.writeFileSync(OUTPUT_MD, renderMarkdown(results), "utf8");

  const failed = results.filter((r) => !r.pass);
  if (failed.length > 0) {
    console.error(`\n[audit] FAIL: ${failed.length} URL(s) failed. Report: ${OUTPUT_MD}`);
    process.exitCode = 1;
  } else {
    console.log(`\n[audit] PASS: all URLs passed. Report: ${OUTPUT_MD}`);
  }
}

await main();
