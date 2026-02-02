param(
  [switch]$DryRun
)

$ErrorActionPreference = 'Stop'

function Write-Info([string]$msg) { Write-Host $msg }

$root = (Get-Location).Path
Write-Info "Workspace: $root"

# Safe patterns for local, gitignored temp artifacts used by this repo.
$rootFilePatterns = @(
  '.tmp*',
  '*.log'
)

$rootDirPatterns = @(
  '.tmp*',
  'playwright-report',
  'test-results'
)

$deleted = 0
$skipped = 0

Write-Info ''
Write-Info '## Cleaning root temp files'
foreach ($pat in $rootFilePatterns) {
  $items = Get-ChildItem -Path $root -Force -File -ErrorAction SilentlyContinue | Where-Object { $_.Name -like $pat }
  foreach ($it in $items) {
    # Avoid nuking real logs people might want; only delete logs that are clearly local tooling outputs.
    $isSafeLog = $it.Name -like '.tmp*' -or $it.Name -match '^(dev(_out|_err)?\.log|build\.log|debug\.log|tailwindcss-\d+\.log)$'
    if ($it.Extension -eq '.log' -and -not $isSafeLog) {
      $skipped += 1
      continue
    }

    if ($DryRun) {
      Write-Info "DRYRUN delete file: $($it.FullName)"
    } else {
      Remove-Item -LiteralPath $it.FullName -Force -ErrorAction SilentlyContinue
    }
    $deleted += 1
  }
}

Write-Info ''
Write-Info '## Cleaning temp folders'
foreach ($pat in $rootDirPatterns) {
  $dirs = Get-ChildItem -Path $root -Force -Directory -ErrorAction SilentlyContinue | Where-Object { $_.Name -like $pat }
  foreach ($d in $dirs) {
    if ($DryRun) {
      Write-Info "DRYRUN delete dir: $($d.FullName)"
    } else {
      Remove-Item -LiteralPath $d.FullName -Recurse -Force -ErrorAction SilentlyContinue
    }
    $deleted += 1
  }
}

Write-Info ''
Write-Info "Done. Deleted actions: $deleted. Skipped: $skipped."
Write-Info 'Tip: for Next.js build caches use the existing VS Code task: clean-next-artifacts'
