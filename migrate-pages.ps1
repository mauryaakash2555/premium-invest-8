# Batch Migration Script: React Router -> Next.js App Router
# This script converts all remaining pages automatically

$mappings = @{
    "MutualFunds.js" = "mutual-funds"
    "FixedDeposits.js" = "fixed-deposits"
    "Insurance.js" = "insurance"
    "TradingServices.js" = "trading-services"
    "PortfolioManagement.js" = "portfolio-management"
    "SIPServices.js" = "sip"
    "Platforms.js" = "platforms"
    "CuratedPartners.js" = "curated-partners"
    "Careers.js" = "careers"
    "Compliance.js" = "compliance"
    "Disclaimer.jsx" = "disclaimer"
    "PrivacyPolicy.jsx" = "privacy"
    "RefundPolicy.jsx" = "refund"
    "TermsAndConditions.jsx" = "terms"
    "Sitemap.js" = "sitemap"
    "BlogDetail.js" = "blog/[slug]"
}

foreach ($source in $mappings.Keys) {
    $dest = $mappings[$source]
    $sourcePath = "frontend\src\pages\$source"
    $destPath = "app\$dest\page.jsx"
    
    if (Test-Path $sourcePath) {
        Write-Host "Migrating $source -> $destPath"
        
        # Read content
        $content = Get-Content $sourcePath -Raw
        
        # Add "use client" at top
        $content = '"use client";' + "`n`n" + $content
        
        # Remove React import (not needed in Next.js 13+)
        $content = $content -replace "import React,?\s*\{?\s*useEffect\s*\}?\s*from\s*'react';\s*\n?", "import { useEffect } from 'react';`n"
        $content = $content -replace "import React from 'react';\s*\n?", ""
        
        # Convert react-router-dom Link to next/link
        $content = $content -replace "import \{ Link \} from 'react-router-dom';", "import Link from 'next/link';"
        $content = $content -replace "import \{ Link, useLocation \} from 'react-router-dom';", "import Link from 'next/link';`nimport { usePathname } from 'next/navigation';"
        $content = $content -replace "import \{ useLocation \} from 'react-router-dom';", "import { usePathname } from 'next/navigation';"
        
        # Convert Link to= to Link href=
        $content = $content -replace '<Link to=', '<Link href='
        
        # Remove Helmet import
        $content = $content -replace "import \{ Helmet \} from 'react-helmet-async';\s*\n?", ""
        
        # Remove Helmet blocks (simplified - removes single-line and basic multi-line)
        $content = $content -replace '(?s)<Helmet>.*?</Helmet>\s*\n?', ''
        
        # Convert useLocation to usePathname
        $content = $content -replace 'const location = useLocation\(\);', 'const pathname = usePathname();'
        $content = $content -replace 'location\.pathname', 'pathname'
        
        # Get function name and convert to default export Page
        $funcMatch = [regex]::Match($content, 'const (\w+) = \(\) => \{')
        if ($funcMatch.Success) {
            $funcName = $funcMatch.Groups[1].Value
            $content = $content -replace "const $funcName = \(\) => \{", 'export default function Page() {'
            $content = $content -replace "export default $funcName;", ''
        }
        
        # Ensure destination directory exists
        $destDir = Split-Path $destPath -Parent
        if (!(Test-Path $destDir)) {
            New-Item -ItemType Directory -Path $destDir -Force | Out-Null
        }
        
        # Write converted content
        $content | Out-File -FilePath $destPath -Encoding UTF8 -NoNewline
        
        Write-Host "  Done: $destPath" -ForegroundColor Green
    } else {
        Write-Host "  Skip: $sourcePath not found" -ForegroundColor Yellow
    }
}

Write-Host "`nMigration complete!" -ForegroundColor Cyan

