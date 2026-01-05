[CmdletBinding()]
param(
  [int]$Port = 3000,
  [int]$TimeoutSeconds = 30,
  [int]$RestartDelaySeconds = 2
)

$ErrorActionPreference = 'Stop'

$AppRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
$StdOut = Join-Path $AppRoot 'dev_out.log'
$StdErr = Join-Path $AppRoot 'dev_err.log'
$ReadyUrl = "http://localhost:$Port/"

function Get-ListeningPid([int]$LocalPort) {
  try {
    $conn = Get-NetTCPConnection -LocalPort $LocalPort -State Listen -ErrorAction Stop | Select-Object -First 1
    if ($null -ne $conn) { return $conn.OwningProcess }
  } catch {
    return $null
  }
  return $null
}

function Wait-Ready([string]$Url, [int]$TimeoutSec) {
  $deadline = (Get-Date).AddSeconds([Math]::Max(5, $TimeoutSec))
  while ((Get-Date) -lt $deadline) {
    try {
      $r = Invoke-WebRequest -Uri $Url -Method Get -TimeoutSec 2 -UseBasicParsing
      if ($r.StatusCode -ge 200 -and $r.StatusCode -lt 500) { return $true }
    } catch {
      # ignore
    }
    Start-Sleep -Milliseconds 250
  }
  return $false
}

Write-Host "KEEP_ALIVE Starting Next.js dev server on $ReadyUrl"
Write-Host "KEEP_ALIVE Logs: $StdOut | $StdErr"

while ($true) {
  $existingPid = Get-ListeningPid -LocalPort $Port
  if ($existingPid) {
    try {
      Stop-Process -Id $existingPid -Force -ErrorAction SilentlyContinue
      Start-Sleep -Milliseconds 400
    } catch {}
  }

  $cmd = "cd /d `"$AppRoot`" && npm.cmd run dev -- -p $Port"
  Write-Host "KEEP_ALIVE START cmd.exe /c $cmd"

  # Start Next in this same task so VS Code keeps it alive. Also log output.
  $p = Start-Process -FilePath 'cmd.exe' -ArgumentList @('/c', $cmd) -WorkingDirectory $AppRoot -NoNewWindow -PassThru -RedirectStandardOutput $StdOut -RedirectStandardError $StdErr

  if (Wait-Ready -Url $ReadyUrl -TimeoutSec $TimeoutSeconds) {
    Write-Host "READY $ReadyUrl"
  } else {
    Write-Host "KEEP_ALIVE WARNING: Server not ready within ${TimeoutSeconds}s (will keep running/restart on exit)."
  }

  # Wait until Next exits, then restart.
  try { Wait-Process -Id $p.Id } catch {}

  Write-Host "KEEP_ALIVE EXITED (pid=$($p.Id)). Restarting in ${RestartDelaySeconds}s..."
  Start-Sleep -Seconds ([Math]::Max(1, $RestartDelaySeconds))
}
