param(
  [Parameter(Mandatory=$false)]
  [string]$InputMp4 = "C:\Users\admin\Downloads\BM LASER.mp4",

  [Parameter(Mandatory=$false)]
  [double]$MinStartSeconds = 1.0,

  [Parameter(Mandatory=$false)]
  [double]$SegmentSeconds = 12.0,

  [Parameter(Mandatory=$false)]
  [double]$ScanStepSeconds = 0.5,

  [Parameter(Mandatory=$false)]
  [double]$RefineStepSeconds = 0.1,

  [Parameter(Mandatory=$false)]
  [double]$ProbeWindowSeconds = 0.06,

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

function Get-FrameSSIM([double]$t1, [double]$t2) {
  $t1s = Invariant $t1
  $t2s = Invariant $t2
  $t1e = Invariant ($t1 + $ProbeWindowSeconds)
  $t2e = Invariant ($t2 + $ProbeWindowSeconds)
  $fc = "[0:v]trim=start=${t1s}:end=${t1e},setpts=PTS-STARTPTS,scale=160:-1[a];[0:v]trim=start=${t2s}:end=${t2e},setpts=PTS-STARTPTS,scale=160:-1[b];[a][b]ssim"

  $out = & $ffmpeg -hide_banner -i $InputMp4 -filter_complex $fc -an -f null - 2>&1
  $text = ($out -join "`n")
  if ($text -match 'All:([0-9\.]+)') {
    return [double]$matches[1]
  }
  return 0.0
}

$dur = Get-DurationSeconds $InputMp4
Write-Host ("Input duration: {0:N3}s" -f $dur)

if ($SegmentSeconds -le 0 -or $SegmentSeconds -ge $dur) {
  throw "SegmentSeconds must be > 0 and < duration. duration=$dur"
}

$maxStart = $dur - $SegmentSeconds - 0.15
if ($maxStart -le 0) {
  throw "Not enough duration to build a segment. maxStart=$maxStart"
}

$scanStart = [Math]::Max(0.0, $MinStartSeconds)
if ($scanStart -gt $maxStart) { $scanStart = 0.0 }

Write-Host ("Searching best loop segment: L={0:N2}s, scanStep={1:N2}s, minStart={2:N2}s" -f $SegmentSeconds, $ScanStepSeconds, $scanStart)

$best = [pscustomobject]@{ start = 0.0; score = -1.0 }

for ($s = $scanStart; $s -le $maxStart; $s += $ScanStepSeconds) {
  $score = Get-FrameSSIM $s ($s + $SegmentSeconds)
  if ($score -gt $best.score) {
    $best = [pscustomobject]@{ start = $s; score = $score }
    Write-Host ("Best so far: start={0:N2}s score={1:N4}" -f $best.start, $best.score)
  }
}

# Refine around the best start.
$refStart = [Math]::Max(0.0, $best.start - $ScanStepSeconds)
$refEnd = [Math]::Min($maxStart, $best.start + $ScanStepSeconds)

Write-Host ("Refining in [{0:N2}s .. {1:N2}s] step={2:N2}s" -f $refStart, $refEnd, $RefineStepSeconds)

$best2 = $best
for ($s = $refStart; $s -le $refEnd; $s += $RefineStepSeconds) {
  $score = Get-FrameSSIM $s ($s + $SegmentSeconds)
  if ($score -gt $best2.score) {
    $best2 = [pscustomobject]@{ start = $s; score = $score }
  }
}

$startFinal = $best2.start
$endFinal = $startFinal + $SegmentSeconds
Write-Host ("Chosen segment: start={0:N3}s end={1:N3}s (SSIM={2:N4})" -f $startFinal, $endFinal, $best2.score)

# Export MP4 (H.264) and WEBM (VP9)
$ss = Invariant $startFinal
$to = Invariant $endFinal

Write-Host "Encoding MP4..."
& $ffmpeg -y -hide_banner -ss $ss -to $to -i $InputMp4 -an -c:v libx264 -crf 18 -preset slow -pix_fmt yuv420p -movflags +faststart $OutMp4

Write-Host "Encoding WEBM..."
& $ffmpeg -y -hide_banner -ss $ss -to $to -i $InputMp4 -an -c:v libvpx-vp9 -b:v 0 -crf 28 -row-mt 1 -pix_fmt yuv420p $OutWebm

# Copy to fallbacks
Copy-Item -LiteralPath $OutMp4 -Destination (Join-Path (Split-Path -Parent $OutMp4) 'laser-beam.mp4') -Force
Copy-Item -LiteralPath $OutWebm -Destination (Join-Path (Split-Path -Parent $OutWebm) 'laser-beam.webm') -Force

# Verification
$outDurMp4 = Get-DurationSeconds $OutMp4
Write-Host ("OK: Output duration={0:N3}s" -f $outDurMp4)
Write-Host "Done."