param(
  [Parameter(Mandatory = $false)]
  [string]$InputMp4 = "C:\Users\admin\Downloads\Laser.mp4",

  # If set (>= 0), skips auto-scanning and uses this start time.
  [Parameter(Mandatory = $false)]
  [double]$SegmentStartSeconds = -1,

  # The source is ~30s; we will pick the best 5s window by scoring seam similarity.
  [Parameter(Mandatory = $false)]
  [double]$SegmentSeconds = 5.0,

  # Crossfade used to hide the seam inside the clip. Keep small for crispness.
  [Parameter(Mandatory = $false)]
  [double]$CrossfadeSeconds = 0.30,

  # Bitrate control (Mbps). Constrained VBR: b:v (target), maxrate, bufsize.
  [Parameter(Mandatory = $false)]
  [int]$TargetMbps = 50,

  [Parameter(Mandatory = $false)]
  [int]$MaxMbps = 60,

  # When enabled, prefer segments with more temporal change (visible pulse).
  [Parameter(Mandatory = $false)]
  [switch]$PreferPulse,

  # Output overwrites the single production asset.
  [Parameter(Mandatory = $false)]
  [string]$OutMp4 = "$PSScriptRoot\..\public\videos\laser-beam.mp4",

  # Safety backup of current output before overwrite
  [Parameter(Mandatory = $false)]
  [string]$BackupDir = "$PSScriptRoot\..\backup\laser-safe"
)

$ErrorActionPreference = 'Stop'

$repoRoot = Resolve-Path -LiteralPath (Join-Path $PSScriptRoot "..")
$toolsBin = Join-Path $repoRoot ".tools\ffmpeg\bin"
$ffmpeg = Join-Path $toolsBin "ffmpeg.exe"
$ffprobe = Join-Path $toolsBin "ffprobe.exe"

if (-not (Test-Path -LiteralPath $ffmpeg) -or -not (Test-Path -LiteralPath $ffprobe)) {
  throw "ffmpeg not found at $toolsBin. Run: pwsh scripts/setup-ffmpeg.ps1"
}

if (-not (Test-Path -LiteralPath $InputMp4)) {
  throw "Input not found: $InputMp4"
}

New-Item -ItemType Directory -Force -Path (Split-Path -Parent $OutMp4) | Out-Null
New-Item -ItemType Directory -Force -Path $BackupDir | Out-Null

function Invariant([double]$v) {
  return $v.ToString([System.Globalization.CultureInfo]::InvariantCulture)
}

function Get-DurationSeconds([string]$path) {
  $d = & $ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 $path
  return [double]$d
}

function Get-SeamScore([double]$start, [double]$segSeconds) {
  # Score seam by comparing first frame and last frame (downscaled for speed).
  $tmp = Join-Path $env:TEMP ("laser_seam_" + [guid]::NewGuid().ToString("N"))
  New-Item -ItemType Directory -Force -Path $tmp | Out-Null
  $firstPng = Join-Path $tmp "first.png"
  $lastPng = Join-Path $tmp "last.png"

  $startS = Invariant $start
  $segS = Invariant $segSeconds

  # First frame
  & $ffmpeg -y -hide_banner -loglevel error -fflags +discardcorrupt -err_detect ignore_err -ss $startS -i $InputMp4 -frames:v 1 -vf "scale=320:-1" $firstPng | Out-Null

  # Last frame: jump near end of the segment; capture one frame
  $nearEnd = [Math]::Max(0.0, $start + $segSeconds - 0.05)
  $nearEndS = Invariant $nearEnd
  & $ffmpeg -y -hide_banner -loglevel error -fflags +discardcorrupt -err_detect ignore_err -ss $nearEndS -i $InputMp4 -frames:v 1 -vf "scale=320:-1" $lastPng | Out-Null

  # SSIM: higher is better (closer frames)
  $ssimLine = & $ffmpeg -hide_banner -loglevel info -i $firstPng -i $lastPng -lavfi "ssim" -f null - 2>&1 | Select-String -Pattern "All:" | Select-Object -First 1
  $score = 0.0
  if ($ssimLine) {
    # Example: "SSIM Y:0.999... U:... V:... All:0.9987 (..dB)"
    $m = [regex]::Match($ssimLine.Line, "All:([0-9\.]+)")
    if ($m.Success) { $score = [double]$m.Groups[1].Value }
  }

  Remove-Item -LiteralPath $tmp -Recurse -Force -ErrorAction SilentlyContinue
  return $score
}

function Get-PulseScore([double]$start, [double]$segSeconds) {
  # Measures average frame-to-frame change (downscaled). Higher => more visible pulse/motion.
  # Uses signalstats on difference frames produced by tblend.
  $startS = Invariant $start
  $lenS = Invariant $segSeconds

  $pulseArgs = @(
    '-hide_banner', '-loglevel', 'warning',
    '-fflags', '+discardcorrupt', '-err_detect', 'ignore_err',
    '-ss', $startS, '-t', $lenS, '-i', $InputMp4,
    '-vf', 'scale=160:-1,format=gray,fps=12,tblend=all_mode=difference,signalstats,metadata=print',
    '-an', '-f', 'null', '-'
  )
  $out = & $ffmpeg @pulseArgs 2>&1

  $vals = @()
  foreach ($line in $out) {
    # Example key: lavfi.signalstats.YAVG=3.21
    $m = [regex]::Match($line, "lavfi\.signalstats\.YAVG=([0-9\.]+)")
    if ($m.Success) { $vals += [double]$m.Groups[1].Value }
  }
  if ($vals.Count -eq 0) { return 0.0 }
  return ($vals | Measure-Object -Average).Average
}

$dur = Get-DurationSeconds $InputMp4
Write-Host ("Input: {0} ({1:N2}s)" -f $InputMp4, $dur)

if ($SegmentSeconds -le 1.0) { throw "SegmentSeconds too small" }
if ($CrossfadeSeconds -le 0.05) { throw "CrossfadeSeconds too small" }
if ($CrossfadeSeconds -ge ($SegmentSeconds / 2.0)) { throw "CrossfadeSeconds must be < SegmentSeconds/2" }

$maxStart = [Math]::Max(0.0, $dur - $SegmentSeconds - 0.1)

if ($SegmentStartSeconds -ge 0) {
  if ($SegmentStartSeconds -gt $maxStart) {
    throw "SegmentStartSeconds too large. Max start is ~${maxStart}s"
  }
  $best = [pscustomobject]@{ Start = $SegmentStartSeconds; Score = 0.0 }
} else {
  Write-Host "Scanning for best ${SegmentSeconds}s seam... (coarse pass)"
  $best = [pscustomobject]@{ Start = 0.0; Score = -1.0 }

  for ($s = 0.0; $s -le $maxStart; $s += 1.0) {
    $seam = Get-SeamScore -start $s -segSeconds $SegmentSeconds
    $pulse = 0.0
    if ($PreferPulse -and $seam -ge 0.82) {
      $pulse = Get-PulseScore -start $s -segSeconds $SegmentSeconds
    }

    # Combine: seam dominates; pulse is a small tie-break.
    $combined = $seam + (0.02 * [Math]::Min(50.0, $pulse))

    if ($PreferPulse) {
      Write-Host ("  start={0,5:N1}s  ssim={1:N5}  pulse={2:N2}  score={3:N5}" -f $s, $seam, $pulse, $combined)
    } else {
      Write-Host ("  start={0,5:N1}s  ssim={1:N5}" -f $s, $seam)
    }

    if ($combined -gt $best.Score) { $best = [pscustomobject]@{ Start = $s; Score = $combined } }
  }

  Write-Host "Refining around best start... (fine pass)"
  $refBest = $best
  $from = [Math]::Max(0.0, $best.Start - 0.8)
  $to = [Math]::Min($maxStart, $best.Start + 0.8)
  for ($s = $from; $s -le $to; $s += 0.1) {
    $seam = Get-SeamScore -start $s -segSeconds $SegmentSeconds
    $pulse = 0.0
    if ($PreferPulse -and $seam -ge 0.82) {
      $pulse = Get-PulseScore -start $s -segSeconds $SegmentSeconds
    }
    $combined = $seam + (0.02 * [Math]::Min(50.0, $pulse))

    if ($PreferPulse) {
      Write-Host ("  start={0,5:N1}s  ssim={1:N5}  pulse={2:N2}  score={3:N5}" -f $s, $seam, $pulse, $combined)
    } else {
      Write-Host ("  start={0,5:N1}s  ssim={1:N5}" -f $s, $seam)
    }

    if ($combined -gt $refBest.Score) { $refBest = [pscustomobject]@{ Start = $s; Score = $combined } }
  }

  $best = $refBest
}

Write-Host ("Chosen window: start={0:N3}s" -f $best.Start)

# Backup current production laser
if (Test-Path -LiteralPath $OutMp4) {
  $stamp = Get-Date -Format "yyyy-MM-dd_HHmmss"
  $backupPath = Join-Path $BackupDir ("laser-beam_before-4k_" + $stamp + ".mp4")
  Copy-Item -LiteralPath $OutMp4 -Destination $backupPath -Force
  Write-Host ("Backup saved: {0}" -f $backupPath)
}

$startS = Invariant $best.Start
$lenS = Invariant $SegmentSeconds
$fadeS = Invariant $CrossfadeSeconds
$pre = $SegmentSeconds - $CrossfadeSeconds
$preS = Invariant $pre

# Build a seamless loop:
# 1) Extract SegmentSeconds segment
# 2) Crossfade the tail into the head (hides seam inside the clip)
# 3) Rotate by CrossfadeSeconds so the loop boundary lands on identical frames
#    (prevents a visible start/end glitch)
$filter = "" +
  "[0:v]trim=start=${startS}:duration=${lenS},setpts=PTS-STARTPTS,split=3[a][b][c];" +
  "[a]trim=start=0:end=${preS},setpts=PTS-STARTPTS[p1];" +
  "[b]trim=start=${preS}:end=${lenS},setpts=PTS-STARTPTS[tail];" +
  "[c]trim=start=0:end=${fadeS},setpts=PTS-STARTPTS[head];" +
  "[tail][head]xfade=transition=fade:duration=${fadeS}:offset=0[xf];" +
  "[p1][xf]concat=n=2:v=1:a=0[preout];" +
  "[preout]split=2[rA][rB];" +
  "[rA]trim=start=${fadeS}:duration=${preS},setpts=PTS-STARTPTS[rotA];" +
  "[rB]trim=start=0:duration=${fadeS},setpts=PTS-STARTPTS[rotB];" +
  "[rotA][rotB]concat=n=2:v=1:a=0[tmp];" +
  "[tmp]trim=duration=${lenS},setpts=PTS-STARTPTS[outv]"

$tmpOut = Join-Path (Split-Path -Parent $OutMp4) ".laser-4k-5s.tmp.mp4"

$target = ($TargetMbps.ToString() + "M")
$maxrate = ($MaxMbps.ToString() + "M")
$bufMbps = [Math]::Max($MaxMbps * 2, $TargetMbps * 2)
$buf = ($bufMbps.ToString() + "M")

Write-Host ("Encoding output at target={0} max={1} buf={2}" -f $target, $maxrate, $buf)

$args = @(
  '-y',
  '-hide_banner',
  '-loglevel', 'error',
  '-stats',
  '-i', $InputMp4,
  '-filter_complex', $filter,
  '-map', '[outv]',
  '-an',
  '-c:v', 'libx264',
  '-preset', 'slow',
  '-pix_fmt', 'yuv420p',
  '-profile:v', 'high',
  '-b:v', $target,
  '-maxrate', $maxrate,
  '-bufsize', $buf,
  '-x264-params', 'keyint=60:min-keyint=60:scenecut=0:open-gop=0',
  '-movflags', '+faststart',
  $tmpOut
)

& $ffmpeg @args

Move-Item -LiteralPath $tmpOut -Destination $OutMp4 -Force

$outDur = Get-DurationSeconds $OutMp4
Write-Host ("OK: wrote {0} (duration={1:N3}s)" -f $OutMp4, $outDur)
