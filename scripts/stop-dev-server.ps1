[CmdletBinding()]
param(
  [int]$Port = 3000
)

$ErrorActionPreference = 'Stop'

function Get-ListeningPid([int]$LocalPort) {
  try {
    $conns = Get-NetTCPConnection -LocalPort $LocalPort -State Listen -ErrorAction Stop
    if ($null -ne $conns) { return @($conns | Select-Object -ExpandProperty OwningProcess) }
  } catch {
    return @()
  }
  return @()
}

$procIds = @(Get-ListeningPid -LocalPort $Port | Where-Object { $_ -and $_ -gt 0 } | Select-Object -Unique)
if (-not $procIds -or $procIds.Count -eq 0) {
  Write-Host "NO_LISTENER :$Port"
  exit 0
}

try {
  foreach ($procId in $procIds) {
    try {
      Stop-Process -Id $procId -Force -ErrorAction Stop
      Write-Host "STOPPED_PID=$procId"
    } catch {
      Write-Warning "Failed to stop PID $procId on :$Port"
    }
  }
  exit 0
} catch {
  Write-Error "Failed to stop one or more listeners on :$Port"
  exit 1
}
