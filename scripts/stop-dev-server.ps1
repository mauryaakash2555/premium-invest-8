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

$procId = Get-ListeningPid -LocalPort $Port
if (-not $procId) {
  Write-Host "NO_LISTENER :$Port"
  exit 0
}

try {
  Stop-Process -Id $procId -Force -ErrorAction Stop
  Write-Host "STOPPED_PID=$procId"
  exit 0
} catch {
  Write-Error "Failed to stop PID $procId on :$Port"
  exit 1
}
