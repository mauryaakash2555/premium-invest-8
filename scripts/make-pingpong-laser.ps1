param(
  [Parameter(Mandatory=$false)]
  [string]$InputMp4 = "$PSScriptRoot\..\public\videos\laser-beam.unicorn.mp4",

  [Parameter(Mandatory=$false)]
  [string]$OutMp4 = "$PSScriptRoot\..\public\videos\laser-beam.unicorn.mp4",

  [Parameter(Mandatory=$false)]
  [string]$OutWebm = "$PSScriptRoot\..\public\videos\laser-beam.unicorn.webm"
)

$ErrorActionPreference = 'Stop'

$repoRoot = Resolve-Path -LiteralPath (Join-Path $PSScriptRoot "..")
$toolsBin = Join-Path $repoRoot ".tools\ffmpeg\bin"
$ffmpeg = Join-Path $toolsBin "ffmpeg.exe"
$ffprobe = Join-Path $toolsBin "ffprobe.exe"

if (-not (Test-Path -LiteralPath $ffmpeg) -or -not (Test-Path -LiteralPath $ffprobe)) {
  throw "ffmpeg not found. Run: pwsh scripts/setup-ffmpeg.ps1"
}

$InputMp4 = (Resolve-Path -LiteralPath $InputMp4).Path

if (-not (Test-Path -LiteralPath $InputMp4)) {
  throw "Input not found: $InputMp4"
}

New-Item -ItemType Directory -Force -Path (Split-Path -Parent $OutMp4) | Out-Null

function Get-DurationSeconds([string]$path) {
  $d = & $ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 $path
  return [double]$d
}

$inDur = Get-DurationSeconds $InputMp4
Write-Host ("Input duration: {0:N3}s" -f $inDur)

$filter = "[0:v]setpts=PTS-STARTPTS,fps=60[v];[v]reverse[r];[v][r]concat=n=2:v=1:a=0[outv]"

$tmpMp4 = Join-Path (Split-Path -Parent $OutMp4) ("." + [IO.Path]::GetFileNameWithoutExtension($OutMp4) + ".tmp.mp4")
$tmpWebm = Join-Path (Split-Path -Parent $OutWebm) ("." + [IO.Path]::GetFileNameWithoutExtension($OutWebm) + ".tmp.webm")

Write-Host "Encoding ping-pong MP4..."
& $ffmpeg -y -hide_banner -i $InputMp4 -filter_complex $filter -map "[outv]" -an -c:v libx264 -crf 18 -preset slow -pix_fmt yuv420p -movflags +faststart $tmpMp4

Write-Host "Encoding ping-pong WEBM..."
& $ffmpeg -y -hide_banner -i $InputMp4 -filter_complex $filter -map "[outv]" -an -c:v libvpx-vp9 -b:v 0 -crf 28 -row-mt 1 -pix_fmt yuv420p $tmpWebm

Move-Item -LiteralPath $tmpMp4 -Destination $OutMp4 -Force
Move-Item -LiteralPath $tmpWebm -Destination $OutWebm -Force

$outDurMp4 = Get-DurationSeconds $OutMp4
$outDurWebm = Get-DurationSeconds $OutWebm

Write-Host ("OK: MP4  duration={0:N3}s" -f $outDurMp4)
Write-Host ("OK: WEBM duration={0:N3}s" -f $outDurWebm)

Write-Host "Done."