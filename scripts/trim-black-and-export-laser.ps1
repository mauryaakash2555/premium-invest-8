param(
  [Parameter(Mandatory=$false)]
  [string]$InputMp4 = "C:\Users\admin\Downloads\BM Wealth no copyright allowed.mp4",

  [Parameter(Mandatory=$false)]
  [string]$OutMp4 = "$PSScriptRoot\..\public\videos\laser-beam.unicorn.mp4",

  [Parameter(Mandatory=$false)]
  [string]$OutWebm = "$PSScriptRoot\..\public\videos\laser-beam.unicorn.webm",

  [Parameter(Mandatory=$false)]
  [double]$HeadWindowSeconds = 2.0,

  [Parameter(Mandatory=$false)]
  [double]$TailWindowSeconds = 0.8,

  [Parameter(Mandatory=$false)]
  [double]$BufferSeconds = 0.04
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

function Get-DurationSeconds([string]$path) {
  $d = & $ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 $path
  return [double]$d
}

$dur = Get-DurationSeconds $InputMp4
Write-Host ("Duration: {0:N3}s" -f $dur)

# Detect black segments (use a relatively sensitive threshold; many exports are "near black")
$blackLog = & $ffmpeg -hide_banner -i $InputMp4 -vf "blackdetect=d=0.02:pix_th=0.20" -an -f null - 2>&1
$segments = @()
foreach ($line in $blackLog) {
  if ($line -match 'black_start[:=]([0-9\.]+)\s+black_end[:=]([0-9\.]+)\s+black_duration[:=]([0-9\.]+)') {
    $segments += [pscustomobject]@{
      start = [double]$matches[1]
      end = [double]$matches[2]
      dur = [double]$matches[3]
    }
  }
}

if ($segments.Count -eq 0) {
  Write-Host "No black segments detected by blackdetect. Will still re-export without trimming."
  $trimStart = 0.0
  $trimEnd = $dur
} else {
  # pick black segment near the start
  $startSeg = $segments | Where-Object { $_.start -le $HeadWindowSeconds } | Sort-Object end -Descending | Select-Object -First 1
  # pick black segment near the end
  $tailThreshold = [Math]::Max(0.0, $dur - $TailWindowSeconds)
  $endSeg = $segments | Where-Object { $_.end -ge $tailThreshold } | Sort-Object start | Select-Object -First 1

  $trimStart = if ($startSeg) { [Math]::Min($dur, $startSeg.end + $BufferSeconds) } else { 0.0 }
  $trimEnd = if ($endSeg) { [Math]::Max(0.0, $endSeg.start - $BufferSeconds) } else { $dur }

  if ($trimEnd -le $trimStart) {
    Write-Warning "Computed invalid trim range; falling back to full duration."
    $trimStart = 0.0
    $trimEnd = $dur
  }

  Write-Host ("Trim range: {0:N3}s -> {1:N3}s" -f $trimStart, $trimEnd)
}

# Export MP4 (H.264)
Write-Host "Encoding MP4..."
& $ffmpeg -y -hide_banner -ss $trimStart -to $trimEnd -i $InputMp4 -an -c:v libx264 -crf 18 -preset slow -pix_fmt yuv420p -movflags +faststart $OutMp4

# Export WEBM (VP9)
Write-Host "Encoding WEBM..."
& $ffmpeg -y -hide_banner -ss $trimStart -to $trimEnd -i $InputMp4 -an -c:v libvpx-vp9 -b:v 0 -crf 28 -row-mt 1 -pix_fmt yuv420p $OutWebm

# Quick verification
$durMp4 = Get-DurationSeconds $OutMp4
$durWebm = Get-DurationSeconds $OutWebm
$mp4Bytes = (Get-Item -LiteralPath $OutMp4).Length
$webmBytes = (Get-Item -LiteralPath $OutWebm).Length

Write-Host ("OK: MP4  duration={0:N3}s size={1:N0} bytes" -f $durMp4, $mp4Bytes)
Write-Host ("OK: WEBM duration={0:N3}s size={1:N0} bytes" -f $durWebm, $webmBytes)

Write-Host "Done. Replace fallbacks too? Run: Copy-Item public\\videos\\laser-beam.unicorn.mp4 public\\videos\\laser-beam.mp4 -Force; Copy-Item public\\videos\\laser-beam.unicorn.webm public\\videos\\laser-beam.webm -Force"
