$ErrorActionPreference = 'Stop'

$timestamp = Get-Date -Format 'yyyy-MM-dd_HHmmss'
$destination = Join-Path -Path 'backup' -ChildPath ("live-intelligence-hero-LOCK_$timestamp")

New-Item -ItemType Directory -Force -Path $destination | Out-Null

$sourceFile = Join-Path -Path 'app\(public)\live-intelligence-hero' -ChildPath 'page.jsx'
$destFile = Join-Path -Path $destination -ChildPath 'page.jsx'
Copy-Item -Force -Path $sourceFile -Destination $destFile

$hash = (Get-FileHash -Path $sourceFile -Algorithm SHA256).Hash
$hash | Out-File -Encoding ascii -FilePath (Join-Path -Path $destination -ChildPath 'page.jsx.sha256.txt')

Write-Host "Locked backup created: $destination"
Write-Host "SHA256(page.jsx): $hash"
