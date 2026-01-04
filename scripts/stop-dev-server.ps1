[CmdletBinding()]
param(
  [int]$Port = 3000
)

$ErrorActionPreference = 'Stop'

function Get-ListeningPid([int]$LocalPort) {
  try {
    $conn = Get-NetTCPConnection -LocalPort $LocalPort -State Listen -ErrorAction Stop | Select-Object -First 1
    if ($null -ne $conn) { return $conn.OwningProcess }
  } catch {
    return $null
  }
  return $null
}

$pid = Get-ListeningPid -LocalPort $Port
if (-not $pid) {
  Write-Host "NO_LISTENER :$Port"
  exit 0
}

try {
  Stop-Process -Id $pid -Force -ErrorAction Stop
  Write-Host "STOPPED_PID=$pid"
  exit 0
} catch {
  Write-Error "Failed to stop PID $pid on :$Port"
  exit 1
}
