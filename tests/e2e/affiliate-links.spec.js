import { test, expect } from "@playwright/test";

const SHOULD_VERIFY_EXTERNAL_NAV = process.env.E2E_EXTERNAL_NAV === "1";

const ALLOWED_REDIRECT_HOSTS = {
  // Axis sometimes redirects from axisbank.co.in to axis.bank.in.
  "web.axisbank.co.in": ["web.axis.bank.in"],
  // YES Bank / Popclub flow uses a different subdomain during redirect.
  "ppipl.getpopcard.co": ["ppipl-pp.getpopcard.co"],
  // IDFC First redirects to a newer official domain.
  "www.idfcfirstbank.com": ["www.idfcfirst.bank.in"],
};

const APPROVED_LINKS = {
  AXIS:
    "https://linksredirect.com/?cid=257199&source=linkkit&url=https%3A%2F%2Fweb.axisbank.co.in%2FDigitalChannel%2FWebForm%2F",
  HDFC:
    "https://linksredirect.com/?cid=257199&source=linkkit&url=https%3A%2F%2Fapplyonline.hdfcbank.com%2Fcards%2Fcredit-cards.html",
  YES:
    "https://linksredirect.com/?cid=257199&source=linkkit&url=https%3A%2F%2Fppipl.getpopcard.co%2F",
  IDFC:
    "https://linksredirect.com/?cid=257199&source=linkkit&url=https%3A%2F%2Fwww.idfcfirstbank.com%2Fcredit-card%2Fntb-diy%2Fapply",
  AU:
    "https://linksredirect.com/?cid=257199&source=linkkit&url=https%3A%2F%2Fsavingsaccount.aubank.in%2Fsaself%2Fmobile-number",
  INDUSIND:
    "https://linksredirect.com/?cid=257199&source=linkkit&url=https%3A%2F%2Finduseasycredit.indusind.bank.in%2Fcustomer%2Fcredit-card%2Fnew-lead",
  LOANHUB:
    "https://linksredirect.com/?cid=257199&source=linkkit&url=https%3A%2F%2Floanhubindia.com%2Fapply-now%2F",
};

function parseExpectedDestination(linkkitHref) {
  const u = new URL(linkkitHref);
  const encoded = u.searchParams.get("url");
  if (!encoded) throw new Error(`Missing url= param in ${linkkitHref}`);
  const decoded = decodeURIComponent(encoded);
  const dest = new URL(decoded);
  return {
    href: decoded,
    host: dest.host,
    pathname: dest.pathname,
  };
}

async function assertAffiliateLinkOpensDestination(page, linkLocator) {
  const href = await linkLocator.getAttribute("href");
  expect(href, "href must exist").toBeTruthy();

  const target = await linkLocator.getAttribute("target");
  const rel = await linkLocator.getAttribute("rel");

  expect(target).toBe("_blank");
  expect(rel).toBe("nofollow sponsored noopener noreferrer");

  const expected = parseExpectedDestination(href);

  // By default, only validate the link structure and attributes.
  // Some partner sites block automated/headless browsers, which makes fully
  // automated destination verification flaky.
  if (!SHOULD_VERIFY_EXTERNAL_NAV) return;

  const [newPage] = await Promise.all([
    page.context().waitForEvent("page"),
    linkLocator.click(),
  ]);

  // Allow redirects to complete; some destinations may be slow.
  await newPage.waitForLoadState("domcontentloaded", { timeout: 60_000 });

  // Wait until we are off the affiliate redirect domain (best-effort).
  try {
    await newPage.waitForURL((url) => !String(url).includes("linksredirect.com"), {
      timeout: 45_000,
    });
  } catch {
    // If it never redirects (blocked), we'll still assert on current URL.
  }

  const finalUrl = new URL(newPage.url());

  const allowedHosts = new Set([expected.host, ...(ALLOWED_REDIRECT_HOSTS[expected.host] || [])]);
  expect(
    allowedHosts.has(finalUrl.host),
    `Unexpected final host: ${finalUrl.host}\nExpected destination: ${expected.href}\nFinal URL: ${finalUrl.href}`,
  ).toBeTruthy();
  // Path can have extra segments or trailing slashes; verify it starts with expected.
  expect(finalUrl.pathname.startsWith(expected.pathname)).toBeTruthy();

  await newPage.close();
}

test.describe.configure({ mode: "serial" });

async function getAffiliateLinkOnPage(page, pagePath, href) {
  await page.goto(pagePath, { waitUntil: "domcontentloaded" });
  const link = page.locator(`a[href="${href}"]`).first();
  await expect(link, `Missing link on ${pagePath}`).toHaveCount(1);
  return link;
}

test("Axis link opens correct destination", async ({ page }) => {
  test.setTimeout(120_000);
  const link = await getAffiliateLinkOnPage(page, "/execution-partners", APPROVED_LINKS.AXIS);
  await assertAffiliateLinkOpensDestination(page, link);
});

test("HDFC link opens correct destination", async ({ page }) => {
  test.setTimeout(120_000);
  const link = await getAffiliateLinkOnPage(page, "/execution-partners", APPROVED_LINKS.HDFC);
  await assertAffiliateLinkOpensDestination(page, link);
});

test("YES Pop Club link opens correct destination", async ({ page }) => {
  test.setTimeout(120_000);
  const link = await getAffiliateLinkOnPage(page, "/execution-partners", APPROVED_LINKS.YES);
  await assertAffiliateLinkOpensDestination(page, link);
});

test("IDFC First link opens correct destination", async ({ page }) => {
  test.setTimeout(120_000);
  const link = await getAffiliateLinkOnPage(page, "/execution-partners", APPROVED_LINKS.IDFC);
  await assertAffiliateLinkOpensDestination(page, link);
});

test("AU Bank link opens correct destination", async ({ page }) => {
  test.setTimeout(120_000);
  const link = await getAffiliateLinkOnPage(page, "/execution-partners", APPROVED_LINKS.AU);
  await assertAffiliateLinkOpensDestination(page, link);
});

test("IndusInd link opens correct destination", async ({ page }) => {
  test.setTimeout(120_000);
  const link = await getAffiliateLinkOnPage(page, "/execution-partners", APPROVED_LINKS.INDUSIND);
  await assertAffiliateLinkOpensDestination(page, link);
});

test("LoanHub link opens correct destination", async ({ page }) => {
  test.setTimeout(120_000);
  const link = await getAffiliateLinkOnPage(page, "/personal-loans-india", APPROVED_LINKS.LOANHUB);
  await assertAffiliateLinkOpensDestination(page, link);
});
