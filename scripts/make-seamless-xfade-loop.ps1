param(
  [Parameter(Mandatory=$false)]
  [string]$InputMp4 = "C:\Users\admin\Downloads\BM LASER.mp4",

  [Parameter(Mandatory=$false)]
  [double]$SegmentStartSeconds = 2.0,

  [Parameter(Mandatory=$false)]
  [double]$SegmentSeconds = 16.0,

  [Parameter(Mandatory=$false)]
  [double]$CrossfadeSeconds = 0.6,

  [Parameter(Mandatory=$false)]
  [string]$XfadeTransition = "slideleft",

  [Parameter(Mandatory=$false)]
  [switch]$NoRotateStartByCrossfade,

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

if (-not (Test-Path -LiteralPath $InputMp4)) {
  throw "Input not found: $InputMp4"
}

New-Item -ItemType Directory -Force -Path (Split-Path -Parent $OutMp4) | Out-Null

function Invariant([double]$v) {
  return $v.ToString([System.Globalization.CultureInfo]::InvariantCulture)
}

function Get-DurationSeconds([string]$path) {
  $d = & $ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 $path
  return [double]$d
}

$dur = Get-DurationSeconds $InputMp4
Write-Host ("Input duration: {0:N3}s" -f $dur)

$RotateStartByCrossfade = -not $NoRotateStartByCrossfade

if ($SegmentStartSeconds -lt 0) { $SegmentStartSeconds = 0 }
if ($SegmentSeconds -le 1) { throw "SegmentSeconds too small" }
if ($CrossfadeSeconds -le 0.05) { throw "CrossfadeSeconds too small" }
if ($CrossfadeSeconds -ge ($SegmentSeconds / 2.0)) { throw "CrossfadeSeconds must be < SegmentSeconds/2" }

$maxStart = $dur - $SegmentSeconds - 0.01
if ($SegmentStartSeconds -gt $maxStart) {
  $SegmentStartSeconds = [Math]::Max(0.0, $maxStart)
}

$start = $SegmentStartSeconds
$end = $start + $SegmentSeconds
$fade = $CrossfadeSeconds
$pre = $SegmentSeconds - $fade

Write-Host ("Building seamless loop: start={0:N3}s length={1:N3}s crossfade={2:N3}s" -f $start, $SegmentSeconds, $fade)

$startS = Invariant $start
$endS = Invariant $end
$preS = Invariant $pre
$fadeS = Invariant $fade

# Strategy:
# 1) Cut a segment [start, start+L]
# 2) Keep the first (L-fade) seconds as-is
# 3) Crossfade the last fade seconds into the first fade seconds
# 4) Concatenate => intermediate length L
# 5) Rotate start by fade seconds (optional) so the loop boundary doesn't create a second seam
$filter = "[0:v]trim=start=${startS}:end=${endS},setpts=PTS-STARTPTS,fps=60,split=3[segA][segB][segC];" +
          "[segA]trim=start=0:end=${preS},setpts=PTS-STARTPTS[p1];" +
          "[segB]trim=start=${preS}:end=${SegmentSeconds},setpts=PTS-STARTPTS[tail];" +
          "[segC]trim=start=0:end=${fadeS},setpts=PTS-STARTPTS[head];" +
          "[tail][head]xfade=transition=${XfadeTransition}:duration=${fadeS}:offset=0[xf];" +
          "[p1][xf]concat=n=2:v=1:a=0[preout];"

if ($RotateStartByCrossfade) {
  $filter = $filter + "[preout]trim=start=${fadeS},setpts=PTS-STARTPTS[outv]"
} else {
  $filter = $filter + "[preout]setpts=PTS-STARTPTS[outv]"
}

$tmpMp4 = Join-Path (Split-Path -Parent $OutMp4) ".laser-xfade.tmp.mp4"
$tmpWebm = Join-Path (Split-Path -Parent $OutWebm) ".laser-xfade.tmp.webm"

Write-Host "Encoding MP4 (higher quality)..."
& $ffmpeg -y -hide_banner -loglevel error -stats -i $InputMp4 -filter_complex $filter -map "[outv]" -an -c:v libx264 -crf 16 -preset slow -pix_fmt yuv420p -bf 0 -x264-params "keyint=60:min-keyint=60:scenecut=0:open-gop=0" -movflags +faststart $tmpMp4

Write-Host "Encoding WEBM (higher quality)..."
& $ffmpeg -y -hide_banner -loglevel error -stats -i $InputMp4 -filter_complex $filter -map "[outv]" -an -c:v libvpx-vp9 -b:v 0 -crf 24 -row-mt 1 -pix_fmt yuv420p -g 60 -auto-alt-ref 0 -lag-in-frames 0 $tmpWebm

Move-Item -LiteralPath $tmpMp4 -Destination $OutMp4 -Force
Move-Item -LiteralPath $tmpWebm -Destination $OutWebm -Force

# Copy to fallbacks
Copy-Item -LiteralPath $OutMp4 -Destination (Join-Path (Split-Path -Parent $OutMp4) 'laser-beam.mp4') -Force
Copy-Item -LiteralPath $OutWebm -Destination (Join-Path (Split-Path -Parent $OutWebm) 'laser-beam.webm') -Force

$outDur = Get-DurationSeconds $OutMp4
Write-Host ("OK: Output duration={0:N3}s" -f $outDur)
Write-Host "Done."