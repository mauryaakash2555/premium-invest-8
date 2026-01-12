param(
  [Parameter(Mandatory=$false)]
  [string]$ToolsDir = "$PSScriptRoot\..\.tools",

  [Parameter(Mandatory=$false)]
  [string]$ZipUrl = "https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip"
)

$ErrorActionPreference = 'Stop'
$toolsPath = $ToolsDir
if (-not (Test-Path -Path $toolsPath)) {
  New-Item -ItemType Directory -Force -Path $toolsPath | Out-Null
}

$ffmpegDir = Join-Path $toolsPath "ffmpeg"
$binDir = Join-Path $ffmpegDir "bin"
$ffmpegExe = Join-Path $binDir "ffmpeg.exe"
$ffprobeExe = Join-Path $binDir "ffprobe.exe"

if ((Test-Path -Path $ffmpegExe) -and (Test-Path -Path $ffprobeExe)) {
  Write-Host "ffmpeg already present: $ffmpegExe"
  Write-Host "ffprobe already present: $ffprobeExe"
  exit 0
}

New-Item -ItemType Directory -Force -Path $ffmpegDir | Out-Null

$zipPath = Join-Path $toolsPath "ffmpeg.zip"
$tempExtract = Join-Path $toolsPath "ffmpeg_extract"

if (Test-Path -Path $tempExtract) {
  Remove-Item -Recurse -Force -Path $tempExtract
}
New-Item -ItemType Directory -Force -Path $tempExtract | Out-Null

Write-Host "Downloading ffmpeg zip..."
function Get-FileBytes([string]$p) {
  if (-not (Test-Path -Path $p)) { return 0 }
  return (Get-Item -Path $p).Length
}

$zipBytes = Get-FileBytes $zipPath
if ($zipBytes -lt 50MB) {
  if (Test-Path -Path $zipPath) { Remove-Item -Force -Path $zipPath }

  # Use curl.exe for large, reliable downloads.
  & curl.exe -L --retry 3 --retry-delay 2 -o $zipPath $ZipUrl
  $zipBytes = Get-FileBytes $zipPath
}

Write-Host ("ffmpeg.zip bytes: {0:N0}" -f $zipBytes)
if ($zipBytes -lt 50MB) {
  throw "Download incomplete (zip too small)."
}

Write-Host "Extracting..."
Expand-Archive -Path $zipPath -DestinationPath $tempExtract -Force

# The zip contains a single top-level folder like ffmpeg-*-essentials_build
$top = Get-ChildItem -Path $tempExtract -Directory | Select-Object -First 1
if (-not $top) { throw "Unexpected zip layout (no top-level folder found)." }

$srcBin = Join-Path $top.FullName "bin"
if (-not (Test-Path -Path $srcBin)) { throw "Unexpected zip layout (missing bin folder)." }

New-Item -ItemType Directory -Force -Path $binDir | Out-Null
Copy-Item -Path (Join-Path $srcBin "ffmpeg.exe") -Destination $ffmpegExe -Force
Copy-Item -Path (Join-Path $srcBin "ffprobe.exe") -Destination $ffprobeExe -Force

Write-Host "Installed: $ffmpegExe"
Write-Host "Installed: $ffprobeExe"

try {
  & $ffmpegExe -version | Select-Object -First 1 | ForEach-Object { Write-Host $_ }
} catch {
  Write-Warning "ffmpeg installed but version check failed: $($_.Exception.Message)"
}
