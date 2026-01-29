param(
  [string]$BaseUrl = 'http://localhost:3000'
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Head-Status([string]$Url) {
  try {
    $r = Invoke-WebRequest -UseBasicParsing -Method Head -Uri $Url -TimeoutSec 5
    return [int]$r.StatusCode
  } catch {
    if ($_.Exception.Response) {
      return [int]$_.Exception.Response.StatusCode
    }
    throw
  }
}

$urls = @(
  "$BaseUrl/",
  "$BaseUrl/_next/static/chunks/webpack.js",
  "$BaseUrl/_next/static/chunks/main-app.js",
  "$BaseUrl/_next/static/chunks/polyfills.js",
  "$BaseUrl/_next/static/chunks/app-pages-internals.js",
  "$BaseUrl/_next/static/chunks/app/(public)/page.js",
  "$BaseUrl/_next/static/chunks/app/layout.js",
  "$BaseUrl/_next/static/css/app/layout.css",
  "$BaseUrl/_next/static/css/app/(public)/page.css"
)

# Probe one real on-disk chunk as a control.
try {
  $diskChunk = Get-ChildItem '.next/static/chunks' -File -Filter '*.js' | Where-Object { $_.Name -notin @('webpack.js', '_error.js') } | Select-Object -First 1
  if ($diskChunk) {
    $urls += "$BaseUrl/_next/static/chunks/$($diskChunk.Name)"
  }
} catch {
  # ignore
}

foreach ($u in $urls) {
  try {
    $status = Head-Status $u
    Write-Output "HEAD $u -> $status"
  } catch {
    Write-Output "HEAD $u -> ERROR: $($_.Exception.Message)"
  }
}

Write-Output ("DISK .next/static/css/app/layout.css exists? {0}" -f (Test-Path '.next/static/css/app/layout.css'))
Write-Output ("DISK .next/static/css/app/(public)/page.css exists? {0}" -f (Test-Path '.next/static/css/app/(public)/page.css'))
Write-Output ("DISK .next/static/chunks/main-app.js exists? {0}" -f (Test-Path '.next/static/chunks/main-app.js'))
Write-Output ("DISK .next/static/chunks/polyfills.js exists? {0}" -f (Test-Path '.next/static/chunks/polyfills.js'))
Write-Output ("DISK .next/static/chunks/app-pages-internals.js exists? {0}" -f (Test-Path '.next/static/chunks/app-pages-internals.js'))
Write-Output ("DISK .next/static/chunks/app/(public)/page.js exists? {0}" -f (Test-Path '.next/static/chunks/app/(public)/page.js'))
Write-Output ("DISK .next/static/chunks/app/layout.js exists? {0}" -f (Test-Path '.next/static/chunks/app/layout.js'))

if (Test-Path '.next/static/chunks') {
  Get-ChildItem '.next/static/chunks' -File -Filter '*.js' | Select-Object -First 5 -ExpandProperty Name | ForEach-Object {
    Write-Output ("DISK chunk: {0}" -f $_)
  }
} else {
  Write-Output 'DISK chunk dir missing: .next/static/chunks'
}

# Also persist output so tooling can display without console wrapping.
try {
  $outPath = Join-Path (Get-Location) '.tmp_next_static_probe.txt'
  $MyInvocation.MyCommand.ScriptBlock.Ast.EndBlock.Statements | Out-Null
  # Re-run the same probe but capture to file.
  $lines = @()
  foreach ($u in $urls) {
    try {
      $status = Head-Status $u
      $lines += "HEAD $u -> $status"
    } catch {
      $lines += "HEAD $u -> ERROR: $($_.Exception.Message)"
    }
  }
  $lines += ("DISK .next/static/css/app/layout.css exists? {0}" -f (Test-Path '.next/static/css/app/layout.css'))
  $lines += ("DISK .next/static/css/app/(public)/page.css exists? {0}" -f (Test-Path '.next/static/css/app/(public)/page.css'))
  $lines += ("DISK .next/static/chunks/main-app.js exists? {0}" -f (Test-Path '.next/static/chunks/main-app.js'))
  $lines += ("DISK .next/static/chunks/polyfills.js exists? {0}" -f (Test-Path '.next/static/chunks/polyfills.js'))
  $lines += ("DISK .next/static/chunks/app-pages-internals.js exists? {0}" -f (Test-Path '.next/static/chunks/app-pages-internals.js'))
  $lines += ("DISK .next/static/chunks/app/(public)/page.js exists? {0}" -f (Test-Path '.next/static/chunks/app/(public)/page.js'))
  $lines += ("DISK .next/static/chunks/app/layout.js exists? {0}" -f (Test-Path '.next/static/chunks/app/layout.js'))
  if (Test-Path '.next/static/chunks') {
    (Get-ChildItem '.next/static/chunks' -File -Filter '*.js' | Select-Object -First 5 -ExpandProperty Name) | ForEach-Object {
      $lines += ("DISK chunk: {0}" -f $_)
    }
  } else {
    $lines += 'DISK chunk dir missing: .next/static/chunks'
  }
  $lines | Set-Content -Encoding UTF8 $outPath
} catch {
  # Non-fatal
}
