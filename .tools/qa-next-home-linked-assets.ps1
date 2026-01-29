param(
  [string]$BaseUrl = 'http://localhost:3000'
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

function Head([string]$Url) {
  try {
    $r = Invoke-WebRequest -UseBasicParsing -Method Head -Uri $Url -TimeoutSec 8
    return [int]$r.StatusCode
  } catch {
    if ($_.Exception.Response) { return [int]$_.Exception.Response.StatusCode }
    return "ERROR: $($_.Exception.Message)"
  }
}

$resp = Invoke-WebRequest -UseBasicParsing -Uri "$BaseUrl/" -TimeoutSec 15
$html = [string]$resp.Content

$assetUrls = @()
[regex]::Matches($html, '(href|src)="(?<u>/_next/static/[^\"]+)"') | ForEach-Object {
  $assetUrls += $_.Groups['u'].Value
}
$assetUrls = $assetUrls | Select-Object -Unique

$lines = @(
  "HOME_STATUS=$([int]$resp.StatusCode)",
  "ASSET_COUNT=$($assetUrls.Count)"
)

foreach ($u in $assetUrls) {
  $full = "$BaseUrl$u"
  $status = Head $full
  $lines += "HEAD $u -> $status"
}

$lines | Set-Content -Encoding UTF8 (Join-Path (Get-Location) '.tmp_home_linked_assets_probe.txt')
