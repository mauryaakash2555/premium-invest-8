$ErrorActionPreference = 'Stop'

$repoRoot = Resolve-Path -LiteralPath (Join-Path $PSScriptRoot "..")
$log = Join-Path $PSScriptRoot ".xfade-debug.log"

Remove-Item -LiteralPath $log -Force -ErrorAction SilentlyContinue

$scriptPath = Join-Path $PSScriptRoot "make-seamless-xfade-loop.ps1"
$input = Join-Path $repoRoot "public\videos\laser-beam.unicorn.mp4"

& $scriptPath -InputMp4 $input -SegmentStartSeconds 0.0 -SegmentSeconds 4.6 -CrossfadeSeconds 0.5 *>> $log

Write-Output "WROTE $log"
