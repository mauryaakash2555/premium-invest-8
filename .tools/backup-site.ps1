# Simple, safe website backup (no node_modules)
# Creates a zip from the current git commit + writes a manifest.

param(
  [string]$Name = "manual"
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

function Say($msg) { Write-Host $msg }

Set-Location "c:\Users\admin\premium-invest-8"

# Basic git checks
& git rev-parse --is-inside-work-tree | Out-Null

$branch = (& git branch --show-current).Trim()
$sha = (& git rev-parse HEAD).Trim()
$ts = Get-Date -Format "yyyy-MM-dd_HHmmss"

$destRoot = Join-Path "backup" "site-snapshots"
$dest = Join-Path $destRoot ("$ts" + "_" + $Name)
New-Item -ItemType Directory -Force -Path $dest | Out-Null

$zipPath = Join-Path $dest "repo.zip"
$manifest = Join-Path $dest "MANIFEST.txt"

@(
  "Backup Time: $ts",
  "Branch: $branch",
  "Commit: $sha",
  "What: Git archive zip (clean code snapshot)",
  "Note: This zip does NOT include node_modules/.next"
) | Set-Content -Encoding UTF8 $manifest

Say "Creating zip at: $zipPath"
& git archive --format=zip --output "$zipPath" HEAD

# Also copy the current locked Live Intelligence backup into the snapshot folder
$liLock = "backup\live-intelligence-locked-2026-01-28"
if (Test-Path $liLock) {
  Say "Copying Live Intelligence lock folder into snapshot..."
  Copy-Item $liLock (Join-Path $dest "live-intelligence-locked-2026-01-28") -Recurse -Force
}

Say "DONE ✅"
Say "Open: $dest"
