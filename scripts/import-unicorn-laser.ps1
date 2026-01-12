param(
  [Parameter(Mandatory=$false)]
  [string]$Webm,

  [Parameter(Mandatory=$false)]
  [string]$Mp4
)

$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot
$destDir = Join-Path $repoRoot 'public\videos'

if (-not (Test-Path -LiteralPath $destDir)) {
  New-Item -ItemType Directory -Path $destDir | Out-Null
}

function Copy-IfProvided {
  param(
    [string]$Source,
    [string]$Destination
  )
  if ([string]::IsNullOrWhiteSpace($Source)) { return }
  if (-not (Test-Path -LiteralPath $Source)) {
    throw "Source not found: $Source"
  }
  Copy-Item -LiteralPath $Source -Destination $Destination -Force
  $bytes = (Get-Item -LiteralPath $Destination).Length
  Write-Host "Copied -> $Destination ($bytes bytes)"
}

Copy-IfProvided -Source $Webm -Destination (Join-Path $destDir 'laser-beam.unicorn.webm')
Copy-IfProvided -Source $Mp4 -Destination (Join-Path $destDir 'laser-beam.unicorn.mp4')

if ([string]::IsNullOrWhiteSpace($Webm) -and [string]::IsNullOrWhiteSpace($Mp4)) {
  Write-Host "Nothing copied. Usage examples:" 
  Write-Host "  pwsh scripts/import-unicorn-laser.ps1 -Webm \"C:\\path\\to\\export.webm\"" 
  Write-Host "  pwsh scripts/import-unicorn-laser.ps1 -Mp4  \"C:\\path\\to\\export.mp4\"" 
  Write-Host "  pwsh scripts/import-unicorn-laser.ps1 -Webm \"...webm\" -Mp4 \"...mp4\"" 
}
