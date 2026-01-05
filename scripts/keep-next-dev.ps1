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
    # Fall through to netstat fallback
  }

  # Fallback: parse netstat (works even when Get-NetTCPConnection is restricted)
  try {
    $lines = & netstat.exe -ano -p TCP | Select-String -Pattern (":$LocalPort\s+")
    foreach ($m in $lines) {
      $parts = ($m.Line -replace "\s+", " ").Trim().Split(' ')
      # Expected: Proto LocalAddress ForeignAddress State PID
      if ($parts.Length -ge 5 -and $parts[3] -eq 'LISTENING') {
        $listenerPid = [int]$parts[4]
        if ($listenerPid -gt 0) { return $listenerPid }
      }
    }
  } catch {
    return $null
  }

  return $null
}

function Wait-PortFree([int]$LocalPort, [int]$TimeoutMs = 2500) {
  $deadline = (Get-Date).AddMilliseconds([Math]::Max(500, $TimeoutMs))
  while ((Get-Date) -lt $deadline) {
    $listenerPid = Get-ListeningPid -LocalPort $LocalPort
    if (-not $listenerPid) { return $true }
    Start-Sleep -Milliseconds 150
  }
  return $false
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

function Repair-NextCacheIfCorrupt([string]$StdErrPath) {
  try {
    if (-not (Test-Path $StdErrPath)) { return $false }
    $tail = Get-Content -Path $StdErrPath -Tail 250 -ErrorAction SilentlyContinue
    if (-not $tail) { return $false }
    $joined = ($tail -join "`n")
    $isCorrupt = ($joined -match "Cannot find module '\./\d+\.js'") -or ($joined -match 'ChunkLoadError')
    if (-not $isCorrupt) { return $false }

    $nextDir = Join-Path $AppRoot '.next'
    if (Test-Path $nextDir) {
      Write-Host "KEEP_ALIVE Detected likely .next corruption. Clearing $nextDir ..."
      Remove-Item -Recurse -Force $nextDir -ErrorAction SilentlyContinue
      Start-Sleep -Milliseconds 250
    }
    return $true
  } catch {
    return $false
  }
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

  [void](Wait-PortFree -LocalPort $Port -TimeoutMs 2500)

  # NOTE: package.json already sets the dev port (next dev -p 3000).
  # Also, on Windows, launching via `cmd.exe /c` can trigger a non-interactive
  # "Terminate batch job (Y/N)?" prompt (which makes the process exit quickly).
  # Start npm directly to keep the dev server alive and log output cleanly.
  $nextBin = Join-Path $AppRoot 'node_modules\next\dist\bin\next'
  Write-Host "KEEP_ALIVE START node $nextBin dev -p $Port"

  # Start Next directly via node so the process we wait on is the long-lived dev server.
  $p = Start-Process -FilePath 'node' -ArgumentList @($nextBin, 'dev', '-p', "$Port") -WorkingDirectory $AppRoot -NoNewWindow -PassThru -RedirectStandardOutput $StdOut -RedirectStandardError $StdErr

  if (Wait-Ready -Url $ReadyUrl -TimeoutSec $TimeoutSeconds) {
    Write-Host "READY $ReadyUrl"
  } else {
    Write-Host "KEEP_ALIVE WARNING: Server not ready within ${TimeoutSeconds}s (will keep running/restart on exit)."
  }

  # IMPORTANT:
  # On Windows, the initial process we spawn can exit while the actual dev server
  # continues running under a child process. Waiting on $p.Id would then cause a
  # false-positive "EXITED" and restart-loop (breaking fetches).
  # Instead, monitor the port health and only restart when it goes down.
  $failStreak = 0
  while ($true) {
    if (Wait-Ready -Url $ReadyUrl -TimeoutSec 2) {
      $failStreak = 0
    } else {
      $failStreak++
      if ($failStreak -ge 3) { break }
    }
    Start-Sleep -Seconds 1
  }

  # If Next is crash-looping due to corrupted build artifacts, clear cache before restart.
  [void](Repair-NextCacheIfCorrupt -StdErrPath $StdErr)

  Write-Host "KEEP_ALIVE DOWN. Restarting in ${RestartDelaySeconds}s..."
  Start-Sleep -Seconds ([Math]::Max(1, $RestartDelaySeconds))
}
