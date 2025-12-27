const fs = require('fs');
const path = require('path');

// Pages to migrate: [source, dest folder, metadata title, metadata description]
const pages = [
  ['About.js', 'about-us', 'About BM Wealth - Led by Brahmdeo Maurya | Mumbai Investment Advisory ARN 90008', 'Learn about BM Wealth and founder Brahmdeo Maurya. IRDAI Licensed and AMFI Registered ARN 90008.'],
  ['Services.js', 'services', 'Financial Services | BM Wealth Mumbai ARN 90008', 'Comprehensive financial services including mutual funds, SIP, portfolio management, and insurance.'],
  ['Contact.js', 'contact', 'Contact BM Wealth Mumbai | Financial Advisory', 'Contact BM Wealth for expert financial advisory services in Mumbai.'],
  ['Careers.js', 'careers', 'Careers at BM Wealth | Join Our Team Mumbai', 'Join BM Wealth Mumbai. Career opportunities in financial advisory.'],
  ['Compliance.js', 'compliance', 'Regulatory Compliance & Investor Charter | BM Wealth Mumbai ARN 90008', 'BM Wealth regulatory compliance, investor charter, and grievance redressal.'],
  ['MutualFunds.js', 'mutual-funds', 'Mutual Funds Advisory | BM Wealth Mumbai ARN 90008', 'Expert mutual fund advisory services by BM Wealth Mumbai.'],
  ['PortfolioManagement.js', 'portfolio-management', 'Portfolio Management Services | BM Wealth Mumbai ARN 90008', 'Expert portfolio management services by BM Wealth.'],
  ['TradingServices.js', 'trading-services', 'Trading Services | BM Wealth Mumbai ARN 90008', 'Professional trading services with real-time market access.'],
  ['Insurance.js', 'insurance', 'Insurance Services | BM Wealth Mumbai IRDAI 277925', 'Comprehensive life and health insurance solutions.'],
  ['FixedDeposits.js', 'fixed-deposits', 'Fixed Deposits Advisory | BM Wealth Mumbai ARN 90008', 'Secure fixed deposit investment options.'],
  ['SIPServices.js', 'sip', 'SIP - Systematic Investment Plans | BM Wealth Mumbai ARN 90008', 'Start your SIP journey with BM Wealth.'],
  ['Sitemap.js', 'sitemap-page', 'Sitemap | BM Wealth Mumbai', 'Complete sitemap of BM Wealth website.'],
  ['TermsAndConditions.jsx', 'terms', 'Terms & Conditions | BM Wealth Mumbai', 'Terms and conditions for using BM Wealth services.'],
  ['PrivacyPolicy.jsx', 'privacy', 'Privacy Policy | BM Wealth Mumbai', 'BM Wealth privacy policy.'],
  ['Disclaimer.jsx', 'disclaimer', 'Disclaimer | BM Wealth Mumbai', 'Investment disclaimer and risk disclosure.'],
  ['RefundPolicy.jsx', 'refund', 'Refund Policy | BM Wealth Mumbai', 'Refund and cancellation policy.'],
];

function convertToNextJS(content, componentName) {
  let result = content;
  
  // Remove Helmet import
  result = result.replace(/import\s*{\s*Helmet\s*}\s*from\s*['"]react-helmet-async['"];\s*/g, '');
  
  // Remove Helmet blocks
  result = result.replace(/<Helmet>[\s\S]*?<\/Helmet>/g, '');
  
  // Fix Link import from react-router-dom to next/link
  result = result.replace(/import\s*{\s*Link\s*}\s*from\s*['"]react-router-dom['"];\s*/g, "import Link from 'next/link';\n");
  result = result.replace(/import\s*{\s*Link,\s*useLocation\s*}\s*from\s*['"]react-router-dom['"];\s*/g, "import Link from 'next/link';\nimport { usePathname } from 'next/navigation';\n");
  result = result.replace(/import\s*{\s*useLocation\s*}\s*from\s*['"]react-router-dom['"];\s*/g, "import { usePathname } from 'next/navigation';\n");
  
  // If Link import from next/link already exists, don't add it again
  if (!result.includes("import Link from 'next/link'") && result.includes('<Link')) {
    result = "import Link from 'next/link';\n" + result;
  }
  
  // Replace <Link to= with <Link href=
  result = result.replace(/<Link\s+to=/g, '<Link href=');
  
  // Replace useLocation with usePathname
  result = result.replace(/const\s+location\s*=\s*useLocation\(\)/g, 'const pathname = usePathname()');
  result = result.replace(/location\.pathname/g, 'pathname');
  
  // Add 'use client' at the top if not present
  if (!result.startsWith("'use client'") && !result.startsWith('"use client"')) {
    result = "'use client';\n\n" + result;
  }
  
  return result;
}

// Create directories and migrate pages
pages.forEach(([source, destFolder, title, description]) => {
  const sourcePath = path.join('frontend', 'src', 'pages', source);
  const destDir = path.join('app', destFolder);
  const destPath = path.join(destDir, 'page.jsx');
  const layoutPath = path.join(destDir, 'layout.js');
  
  if (!fs.existsSync(sourcePath)) {
    console.log(`SKIP: ${source} not found`);
    return;
  }
  
  // Create directory
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  
  // Read and convert
  let content = fs.readFileSync(sourcePath, 'utf8');
  const componentName = source.replace(/\.(js|jsx)$/, '');
  content = convertToNextJS(content, componentName);
  
  // Write page
  fs.writeFileSync(destPath, content);
  console.log(`MIGRATED: ${source} -> ${destPath}`);
  
  // Write layout with metadata
  const layoutContent = `export const metadata = {
  title: '${title}',
  description: '${description}',
};

export default function Layout({ children }) {
  return children;
}
`;
  fs.writeFileSync(layoutPath, layoutContent);
});

console.log('\nMigration complete!');

