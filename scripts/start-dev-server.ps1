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
    $conn = Get-NetTCPConnection -LocalPort $LocalPort -State Listen -ErrorAction Stop | Select-Object -First 1
    if ($null -ne $conn) { return $conn.OwningProcess }
  } catch {
    return $null
  }
  return $null
}

$existingPid = Get-ListeningPid -LocalPort $Port
if ($existingPid) {
  try { Stop-Process -Id $existingPid -Force -ErrorAction SilentlyContinue } catch {}
  Start-Sleep -Milliseconds 300
}

# Start Next dev server detached, so the task can finish once it is ready.
$cmd = "cd /d `"$AppRoot`" && npm run dev"
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
