const fs = require('fs');

// Read original Contact.js and convert it properly
let content = fs.readFileSync('frontend/src/pages/Contact.js', 'utf8');

// Add 'use client'
content = "'use client';\n\n" + content;

// Remove Helmet import
content = content.replace(/import\s*{\s*Helmet\s*}\s*from\s*['"]react-helmet-async['"];\s*/g, '');

// Remove Helmet blocks
content = content.replace(/<Helmet>[\s\S]*?<\/Helmet>/g, '');

// Remove sonner import
content = content.replace(/import\s*{\s*toast\s*}\s*from\s*['"]sonner['"];\s*/g, '');

// Replace toast.success with console.log
content = content.replace(/toast\.success\([^)]+\{[\s\S]*?\}\);/g, "console.log('Form submitted successfully');");

// Replace toast.error with console.error  
content = content.replace(/toast\.error\([^)]+\{[\s\S]*?\}\);/g, "console.error('Error submitting form');");

// Fix Link import
content = content.replace(/import\s*{\s*Link\s*}\s*from\s*['"]react-router-dom['"];\s*/g, "import Link from 'next/link';\n");
content = content.replace(/<Link\s+to=/g, '<Link href=');

fs.writeFileSync('app/contact/page.jsx', content);
console.log('Fixed Contact page');

