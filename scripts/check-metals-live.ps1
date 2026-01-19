$ErrorActionPreference = 'Stop'

$uri = 'https://api.metals.live/v1/spot'
$outFile = Join-Path $PSScriptRoot 'metals-live.out.txt'
$lines = New-Object System.Collections.Generic.List[string]
try {
  $res = Invoke-WebRequest -Uri $uri -Headers @{ 'Accept'='application/json' } -UseBasicParsing
  $lines.Add(("status={0} len={1}" -f $res.StatusCode, $res.Content.Length))
  $headLen = [Math]::Min(300, $res.Content.Length)
  $lines.Add($res.Content.Substring(0, $headLen))
} catch {
  $lines.Add(("FAILED: {0}" -f $_.Exception.Message))
  $lines | Set-Content -Path $outFile -Encoding UTF8
  $lines | ForEach-Object { Write-Output $_ }
  exit 1
}

$lines | Set-Content -Path $outFile -Encoding UTF8
$lines | ForEach-Object { Write-Output $_ }
