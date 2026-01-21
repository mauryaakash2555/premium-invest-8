import http from 'node:http';
import fs from 'node:fs';

const BASE_HOST = 'localhost';
const BASE_PORT = 3000;

function requestHtml({ hostHeader, path }) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        host: BASE_HOST,
        port: BASE_PORT,
        path,
        method: 'GET',
        headers: {
          Host: hostHeader,
          'User-Agent': 'CCAvenueUnderwriterAudit/1.0',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      },
      (res) => {
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => {
          const body = Buffer.concat(chunks).toString('utf8');
          resolve({ status: res.statusCode ?? 0, headers: res.headers, body });
        });
      }
    );
    req.on('error', reject);
    req.end();
  });
}

function extractTitle(html) {
  const m = html.match(/<title>([\s\S]*?)<\/title>/i);
  if (!m) return '';
  return m[1].replace(/\s+/g, ' ').trim();
}

function stripScriptsAndStyles(html) {
  return html
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ');
}

function extractHeadText(html) {
  const m = html.match(/<head\b[\s\S]*?<\/head>/i);
  if (!m) return '';
  const head = stripScriptsAndStyles(m[0]);
  return head.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function extractVisibleText(html) {
  const cleaned = stripScriptsAndStyles(html);
  return cleaned.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function uniqueMatches(html, re) {
  const out = new Set();
  let m;
  // Ensure global.
  const flags = re.flags.includes('g') ? re.flags : re.flags + 'g';
  const rg = new RegExp(re.source, flags);
  while ((m = rg.exec(html)) !== null) {
    out.add(String(m[0]).toLowerCase());
    if (m.index === rg.lastIndex) rg.lastIndex++;
  }
  return [...out].sort();
}

function passFail(ok) {
  return ok ? 'PASS' : 'FAIL';
}

function printCheck(name, ok, detail = '') {
  const line = `${passFail(ok)} | ${name}${detail ? ` | ${detail}` : ''}`;
  lines.push(line);
  console.log(line);
}

async function main() {
  lines.length = 0;
  const banned = /\b(mutual\s+funds?|mutual\b|sip\b|portfolio\b|invest(ment|ing|or|ors)?\b|wealth\b|return(s)?\b|equity\b|debt\b|aum\b|risk\b|advis(or|ory)\b)\b/i;
  const badNav = /(Services|Blog|Live\s*Intel|Client\s*Portal|Curated\s*Partners|Partners|Dashboard)/i;

  // 1) Store home: title + banned words
  const storeHome = await requestHtml({ hostHeader: 'store.bmwealth.co.in', path: '/' });
  const storeHomeTitle = extractTitle(storeHome.body);
  const storeHomeHeadText = extractHeadText(storeHome.body);
  const storeHomeVisibleText = extractVisibleText(storeHome.body);
  const storeHomeBanned = uniqueMatches(`${storeHomeHeadText} ${storeHomeVisibleText}`, banned);
  printCheck('Store home HTTP 200', storeHome.status === 200, `HTTP=${storeHome.status}`);
  const titleBanned = uniqueMatches(storeHomeTitle, banned);
  printCheck('Store home title has no finance words', titleBanned.length === 0, `TITLE="${storeHomeTitle}" BANNED=${titleBanned.join(',') || '<none>'}`);
  printCheck('Store home visible text has no finance words', storeHomeBanned.length === 0, `BANNED=${storeHomeBanned.join(',') || '<none>'}`);

  // 2) Store navbar contamination
  const storeNavBad = uniqueMatches(storeHome.body, badNav);
  printCheck('Store navbar has no finance links', storeNavBad.length === 0, `FOUND=${storeNavBad.join(',') || '<none>'}`);

  // 3) Store products listing
  const storeProducts = await requestHtml({ hostHeader: 'store.bmwealth.co.in', path: '/products' });
  const storeProductsVisible = extractVisibleText(storeProducts.body);
  const storeProductsHead = extractHeadText(storeProducts.body);
  const storeProductsBanned = uniqueMatches(`${storeProductsHead} ${storeProductsVisible}`, banned);
  printCheck('Store /products HTTP 200', storeProducts.status === 200, `HTTP=${storeProducts.status}`);
  printCheck('Store /products shows ₹', storeProducts.body.includes('₹'));
  printCheck('Store /products mentions digital delivery', /digital/i.test(storeProductsVisible));
  printCheck('Store /products has no finance words', storeProductsBanned.length === 0, `BANNED=${storeProductsBanned.join(',') || '<none>'}`);

  // 4) One product detail page
  const pdpPath = '/products/basics-of-personal-finance';
  const storePdp = await requestHtml({ hostHeader: 'store.bmwealth.co.in', path: pdpPath });
  const storePdpVisible = extractVisibleText(storePdp.body);
  const storePdpHead = extractHeadText(storePdp.body);
  const storePdpBanned = uniqueMatches(`${storePdpHead} ${storePdpVisible}`, banned);
  printCheck(`Store ${pdpPath} HTTP 200`, storePdp.status === 200, `HTTP=${storePdp.status}`);
  printCheck('PDP shows ₹', storePdp.body.includes('₹'));
  printCheck('PDP says delivered digitally', /delivered\s+digitally/i.test(storePdpVisible));
  printCheck('PDP shows disclaimer in body', /educational purposes only/i.test(storePdpVisible));
  printCheck('PDP has no finance words', storePdpBanned.length === 0, `BANNED=${storePdpBanned.join(',') || '<none>'}`);

  // 5) Footer legal pages exist
  for (const p of ['/terms', '/privacy', '/refund', '/delivery']) {
    const res = await requestHtml({ hostHeader: 'store.bmwealth.co.in', path: p });
    printCheck(`Store legal page ${p} HTTP 200`, res.status === 200, `HTTP=${res.status}`);
    if (p === '/delivery') {
      printCheck('Delivery page says no physical goods', /no physical goods are shipped/i.test(res.body));
      printCheck('Delivery page says delivered digitally', /delivered digitally/i.test(res.body) || /delivered\s+digitally/i.test(res.body));
    }
  }

  // 6) Cross-site contamination: store host /blog and /services should be 404
  for (const p of ['/blog', '/services']) {
    const res = await requestHtml({ hostHeader: 'store.bmwealth.co.in', path: p });
    printCheck(`Store host ${p} is not accessible`, res.status === 404, `HTTP=${res.status}`);
  }

  // 7) Main domain isolation
  for (const p of ['/products', '/products/anything', '/checkout', '/store', '/store/anything']) {
    const res = await requestHtml({ hostHeader: 'bmwealth.co.in', path: p });
    printCheck(`Main host blocks ${p}`, res.status === 404, `HTTP=${res.status}`);
  }

  // 8) Store contact realism
  const storeContact = await requestHtml({ hostHeader: 'store.bmwealth.co.in', path: '/contact' });
  printCheck('Store /contact HTTP 200', storeContact.status === 200, `HTTP=${storeContact.status}`);
  printCheck('Store contact has email', /support@bmwealth\.co\.in/i.test(storeContact.body));
  printCheck('Store contact has phone', /8850977259/.test(storeContact.body));
  printCheck('Store contact has city/state', /mumbai,\s*maharashtra/i.test(storeContact.body));

  try {
    fs.writeFileSync('.ccavenue_audit_output.txt', lines.join('\n') + '\n', 'utf8');
  } catch {
    // ignore
  }
}

const lines = [];

main().catch((err) => {
  console.error('Audit script failed:', err);
  process.exitCode = 1;
});
