param(
  [string]$BaseUrl = 'http://localhost:3000'
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$resp = Invoke-WebRequest -UseBasicParsing -Method Get -Uri "$BaseUrl/" -TimeoutSec 10
$html = [string]$resp.Content
$outPath = Join-Path (Get-Location) '.tmp_home_assets.txt'

$links = @()
$links += "STATUS=" + [int]$resp.StatusCode
$links += "LEN=" + $html.Length

# Capture CSS hrefs
[regex]::Matches($html, 'href="(?<u>[^\"]*/_next/static/css[^\"]*)"') | ForEach-Object {
  $links += "CSS=" + $_.Groups['u'].Value
}

# Capture script srcs
[regex]::Matches($html, 'src="(?<u>[^\"]*/_next/static/[^\"]*\.js[^\"]*)"') | ForEach-Object {
  $links += "JS=" + $_.Groups['u'].Value
}

# Also include buildId-ish markers if present
if ($html -match 'buildId') { $links += 'HAS_buildId=1' } else { $links += 'HAS_buildId=0' }
if ($html -match '__NEXT_DATA__') { $links += 'HAS___NEXT_DATA__=1' } else { $links += 'HAS___NEXT_DATA__=0' }

$links | Set-Content -Encoding UTF8 $outPath
