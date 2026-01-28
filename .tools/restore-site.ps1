# Kid-simple restore helper
# Restores the whole website to the locked tag, in a NEW branch.

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

Set-Location "c:\Users\admin\premium-invest-8"

Write-Host "Fetching tags..."
& git fetch --all --tags

$tag = "LOCKED_SITE_2026-01-28"
$branch = "recovery-2026-01-28"

Write-Host "Creating branch: $branch from tag: $tag"
& git checkout -B $branch $tag

Write-Host "Installing packages..."
& npm install

Write-Host "DONE ✅"
Write-Host "Now run: npm run dev"
