[CmdletBinding()]
param(
  [int]$Port = 3000,
  [int]$TimeoutSeconds = 30
)

$ErrorActionPreference = 'Stop'

$AppRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
$StdOut = Join-Path $AppRoot 'dev_out.log'
$StdErr = Join-Path $AppRoot 'dev_err.log'

function Get-ListeningPid([int]$LocalPort) {
  try {
    $conns = Get-NetTCPConnection -LocalPort $LocalPort -State Listen -ErrorAction Stop
    if ($null -ne $conns) { return @($conns | Select-Object -ExpandProperty OwningProcess) }
  } catch {
    return @()
  }
  return @()
}

$existingPids = @(Get-ListeningPid -LocalPort $Port | Where-Object { $_ -and $_ -gt 0 } | Select-Object -Unique)
if ($existingPids -and $existingPids.Count -gt 0) {
  foreach ($existingPid in $existingPids) {
    try { Stop-Process -Id $existingPid -Force -ErrorAction SilentlyContinue } catch {}
  }
  Start-Sleep -Milliseconds 300
}

# Clear potentially stale build artifacts that can confuse webviews (VS Code Simple Browser)
# and cause webpack runtime errors after restarts.
try {
  $nextDir = Join-Path $AppRoot '.next'
  if (Test-Path $nextDir) {
    try { Remove-Item -Recurse -Force (Join-Path $nextDir 'cache') -ErrorAction SilentlyContinue } catch {}
    try { Remove-Item -Recurse -Force (Join-Path $nextDir 'static') -ErrorAction SilentlyContinue } catch {}
  }
} catch {}

# Start Next dev server detached, so the task can finish once it is ready.
# Use npx so the requested -Port is honored (package.json dev script is pinned to 3000).
$cmd = "cd /d `"$AppRoot`" && npx.cmd next dev -p $Port"
Start-Process -FilePath 'cmd.exe' -ArgumentList @('/c', $cmd) -WorkingDirectory $AppRoot -WindowStyle Hidden -RedirectStandardOutput $StdOut -RedirectStandardError $StdErr

$deadline = (Get-Date).AddSeconds($TimeoutSeconds)
$readyUrl = "http://localhost:$Port/"

while ((Get-Date) -lt $deadline) {
  try {
    $r = Invoke-WebRequest -Uri $readyUrl -Method Get -TimeoutSec 2 -UseBasicParsing
    if ($r.StatusCode -ge 200 -and $r.StatusCode -lt 500) {
      Write-Host "READY $readyUrl"
      exit 0
    }
  } catch {
    # ignore until timeout
  }
  Start-Sleep -Milliseconds 250
}

Write-Error "Dev server did not become ready in ${TimeoutSeconds}s. Check logs: $StdOut and $StdErr"
exit 1
