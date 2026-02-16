import { chromium } from 'playwright';

async function main() {
  const url = 'https://www.bmwealth.co.in/about-us';
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

  console.log('========== ABOUT-US LIVE VIDEO AUDIT ==========');
  console.log('URL:', url);

  const res = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60_000 });
  console.log('HTTP Status:', res?.status?.() ?? 'unknown');
  console.log('Title:', await page.title());

  // Give client hydration a moment.
  await page.waitForTimeout(1500);

  const videos = await page.$$eval('video', (els) =>
    els.map((v) => {
      const sources = Array.from(v.querySelectorAll('source')).map((s) => s.getAttribute('src'));
      return {
        src: v.getAttribute('src'),
        poster: v.getAttribute('poster'),
        sources,
        autoplay: v.hasAttribute('autoplay'),
        muted: v.hasAttribute('muted'),
        loop: v.hasAttribute('loop'),
      };
    })
  );

  const iframes = await page.$$eval('iframe', (els) =>
    els.map((i) => ({
      src: i.getAttribute('src'),
      dataSrc: i.getAttribute('data-src'),
      title: i.getAttribute('title'),
      id: i.getAttribute('id'),
      className: i.getAttribute('class'),
      outerHTML: i.outerHTML,
    }))
  );

  console.log('Found <video>:', videos.length);
  if (videos.length) console.log(JSON.stringify(videos, null, 2));

  console.log('Found <iframe>:', iframes.length);
  if (iframes.length) console.log(JSON.stringify(iframes, null, 2));

  await page.screenshot({ path: 'playwright-report/about-us-live.png', fullPage: true });
  console.log('Screenshot: playwright-report/about-us-live.png');

  await page.close();
  await browser.close();
}

main().catch((e) => {
  console.error('Fatal:', e);
  process.exitCode = 1;
});
