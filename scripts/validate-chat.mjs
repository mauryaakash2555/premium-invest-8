import fs from 'node:fs';

const files = [
  'components/AIChatFloat.jsx',
  'components/AIChatFloat.module.css',
  'components/WhatsAppFloat.jsx',
  'components/ChatErrorBoundary.jsx',
];

function read(p) {
  return fs.readFileSync(p, 'utf8');
}

function fail(msg) {
  console.error('CHAT VALIDATION FAILED:', msg);
  process.exit(2);
}

for (const f of files) {
  if (!fs.existsSync(f)) fail(`missing file: ${f}`);
}

const chat = read('components/AIChatFloat.jsx');

// Basic sanity checks
if (!chat.includes('export default function AIChatFloat')) fail('AIChatFloat export missing');
if (!chat.includes('function wantsHuman')) fail('wantsHuman missing');
if (/shouldShow\s+is\s+not\s+defined/i.test(chat)) fail('contains shouldShow runtime error text');

// Guard against the exact previous break: shouldShow referenced in wantsHuman()
const wantsHumanBlock = chat.split('function wantsHuman')[1] || '';
if (wantsHumanBlock.includes('shouldShow')) fail('wantsHuman() references shouldShow');

const wa = read('components/WhatsAppFloat.jsx');
if (!wa.includes('<AIChatFloat')) fail('WhatsAppFloat does not render AIChatFloat');
if (!wa.includes('ChatErrorBoundary')) fail('WhatsAppFloat not wrapped in ChatErrorBoundary');

console.log('OK chat validation passed');
process.exit(0);
