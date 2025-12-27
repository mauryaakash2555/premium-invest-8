const fs = require('fs');
const path = require('path');

function convertToNextJS(content) {
  let result = content;
  result = result.replace(/import\s*{\s*Helmet\s*}\s*from\s*['"]react-helmet-async['"];\s*/g, '');
  result = result.replace(/<Helmet>[\s\S]*?<\/Helmet>/g, '');
  result = result.replace(/import\s*{\s*Link\s*}\s*from\s*['"]react-router-dom['"];\s*/g, "import Link from 'next/link';\n");
  result = result.replace(/import\s*{\s*Link,\s*useLocation\s*}\s*from\s*['"]react-router-dom['"];\s*/g, "import Link from 'next/link';\nimport { usePathname } from 'next/navigation';\n");
  result = result.replace(/<Link\s+to=/g, '<Link href=');
  result = result.replace(/const\s+location\s*=\s*useLocation\(\)/g, 'const pathname = usePathname()');
  result = result.replace(/location\.pathname/g, 'pathname');
  if (!result.startsWith("'use client'") && !result.startsWith('"use client"')) {
    result = "'use client';\n\n" + result;
  }
  return result;
}

// Migrate Home page
console.log('Migrating Home.js...');
let home = fs.readFileSync('frontend/src/pages/Home.js', 'utf8');
home = convertToNextJS(home);
// Rename the component export
home = home.replace(/export default Home;?\s*$/, 'export default Home;');
fs.writeFileSync('app/page.jsx', home);
console.log('Migrated Home.js -> app/page.jsx');

// Migrate Navigation component
console.log('Migrating Navigation...');
if (!fs.existsSync('components')) {
  fs.mkdirSync('components');
}
let nav = fs.readFileSync('frontend/src/components/Navigation.js', 'utf8');
nav = convertToNextJS(nav);
// Fix cn import
nav = nav.replace(/from '\.\.\/lib\/utils'/g, "from '@/lib/utils'");
fs.writeFileSync('components/Navigation.jsx', nav);
console.log('Migrated Navigation.js');

// Migrate Footer component
console.log('Migrating Footer...');
let footer = fs.readFileSync('frontend/src/components/Footer.js', 'utf8');
footer = convertToNextJS(footer);
fs.writeFileSync('components/Footer.jsx', footer);
console.log('Migrated Footer.js');

// Migrate LuxuryMobileDock component
console.log('Migrating LuxuryMobileDock...');
let dock = fs.readFileSync('frontend/src/components/LuxuryMobileDock.js', 'utf8');
dock = convertToNextJS(dock);
fs.writeFileSync('components/LuxuryMobileDock.jsx', dock);
console.log('Migrated LuxuryMobileDock.js');

// Create lib/utils.js for cn function
console.log('Creating lib/utils.js...');
if (!fs.existsSync('lib')) {
  fs.mkdirSync('lib');
}
const utilsContent = `import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
`;
fs.writeFileSync('lib/utils.js', utilsContent);
console.log('Created lib/utils.js');

console.log('\nAll components migrated!');

