param(
  [int]$Port = 3000,
  [int]$TimeoutSeconds = 30,
  [string]$TaskName = 'PremiumInvest8-DevServer-3000'
)

$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot
$keepAliveScript = Join-Path $repoRoot 'scripts\keep-next-dev.ps1'

if (-not (Test-Path $keepAliveScript)) {
  throw "keep-next-dev.ps1 not found at: $keepAliveScript"
}

$pwsh = (Get-Command pwsh -ErrorAction SilentlyContinue)?.Source
if (-not $pwsh) {
  $pwsh = (Get-Command powershell -ErrorAction Stop).Source
}

$arguments = @(
  '-NoProfile',
  '-ExecutionPolicy',
  'Bypass',
  '-File',
  ('"' + $keepAliveScript + '"'),
  '-Port',
  $Port,
  '-TimeoutSeconds',
  $TimeoutSeconds
) -join ' '

$action = New-ScheduledTaskAction -Execute $pwsh -Argument $arguments -WorkingDirectory $repoRoot
$trigger = New-ScheduledTaskTrigger -AtLogOn

$settings = New-ScheduledTaskSettingsSet \
  -AllowStartIfOnBatteries \
  -DontStopIfGoingOnBatteries \
  -StartWhenAvailable \
  -RestartCount 999 \
  -RestartInterval (New-TimeSpan -Minutes 1)

try {
  Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -ErrorAction SilentlyContinue | Out-Null
} catch {}

Register-ScheduledTask \
  -TaskName $TaskName \
  -Action $action \
  -Trigger $trigger \
  -Settings $settings \
  -Description "Auto-start Premium Invest 8 Next.js dev server (keep-alive) on port $Port" \
  -User $env:USERNAME \
  -RunLevel LeastPrivilege \
  | Out-Null

Write-Output "Installed Scheduled Task: $TaskName"
Write-Output "It will start the dev server at logon on port $Port."
Write-Output "To remove: Unregister-ScheduledTask -TaskName '$TaskName' -Confirm:\$false"