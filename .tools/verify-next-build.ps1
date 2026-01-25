$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

Set-Location (Split-Path -Parent $PSScriptRoot)

$logPath = Join-Path (Get-Location) '.tmp_vercel_build.log'
$exitPath = Join-Path (Get-Location) '.tmp_vercel_build_exit.txt'

if (Test-Path .next) {
  Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
}

$proc = Start-Process -FilePath 'cmd.exe' -ArgumentList @('/d','/s','/c','npm run build') -NoNewWindow -PassThru -RedirectStandardOutput $logPath -RedirectStandardError $logPath
$proc.WaitForExit()

Set-Content -Encoding UTF8 -Path $exitPath -Value ("EXIT={0}" -f $proc.ExitCode)
exit $proc.ExitCode
