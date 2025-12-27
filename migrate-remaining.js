const fs = require('fs');

function convertToNextJS(content) {
  let result = content;
  result = result.replace(/import\s*{\s*Helmet\s*}\s*from\s*['"]react-helmet-async['"];\s*/g, '');
  result = result.replace(/<Helmet>[\s\S]*?<\/Helmet>/g, '');
  result = result.replace(/import\s*{\s*Link\s*}\s*from\s*['"]react-router-dom['"];\s*/g, "import Link from 'next/link';\n");
  result = result.replace(/<Link\s+to=/g, '<Link href=');
  if (!result.startsWith("'use client'") && !result.startsWith('"use client"')) {
    result = "'use client';\n\n" + result;
  }
  return result;
}

// Migrate Platforms
let platforms = fs.readFileSync('frontend/src/pages/Platforms.js', 'utf8');
platforms = convertToNextJS(platforms);
fs.writeFileSync('app/platforms/page.jsx', platforms);
console.log('Migrated Platforms.js with full content');

// Migrate CuratedPartners
let curated = fs.readFileSync('frontend/src/pages/CuratedPartners.js', 'utf8');
curated = convertToNextJS(curated);
fs.writeFileSync('app/curated-partners/page.jsx', curated);
console.log('Migrated CuratedPartners.js with full content');

console.log('Done!');

