param(
  [string]$WorkspacePath = (Get-Location).Path,
  [switch]$DryRun
)

$ErrorActionPreference = 'Stop'

function Write-Info([string]$msg) { Write-Host $msg }

$wsRoot = Join-Path $env:APPDATA 'Code\User\workspaceStorage'
if (!(Test-Path $wsRoot)) {
  throw "VS Code workspaceStorage not found: $wsRoot"
}

$workspaceFull = (Resolve-Path -LiteralPath $WorkspacePath).Path
Write-Info "Target workspace path: $workspaceFull"
Write-Info "workspaceStorage root: $wsRoot"

# VS Code stores folder workspaces as URIs in workspace.json.
# We'll match conservatively by checking whether workspace.json contains the normalized path.
# This avoids brittle parsing across VS Code versions.
$needle1 = $workspaceFull.Replace('\\','/')
$needle2 = $workspaceFull

$matches = @()
Get-ChildItem -Path $wsRoot -Directory -Force | ForEach-Object {
  $dir = $_.FullName
  $meta = Join-Path $dir 'workspace.json'
  if (!(Test-Path $meta)) { return }

  $raw = Get-Content -LiteralPath $meta -Raw -ErrorAction SilentlyContinue
  if (!$raw) { return }

  if ($raw -like "*$needle1*" -or $raw -like "*$needle2*") {
    $matches += $dir
  }
}

if ($matches.Count -eq 0) {
  Write-Info 'No matching workspaceStorage folders found.'
  Write-Info 'If VS Code is currently open on this folder, CLOSE ALL VS CODE WINDOWS and run again.'
  exit 0
}

Write-Info ''
Write-Info 'Matching workspaceStorage folders:'
$matches | ForEach-Object { Write-Info (" - " + $_) }

Write-Info ''
if ($DryRun) {
  Write-Info 'DRYRUN: nothing deleted.'
  exit 0
}

Write-Info 'Deleting matching workspaceStorage folders...'
foreach ($m in $matches) {
  try {
    Remove-Item -LiteralPath $m -Recurse -Force -ErrorAction Stop
    Write-Info ("Deleted: " + $m)
  } catch {
    Write-Info ("FAILED to delete: " + $m)
    Write-Info ("Reason: " + $_.Exception.Message)
    Write-Info 'Make sure VS Code is fully closed (no background Code.exe) and try again.'
  }
}

Write-Info 'Done.'
