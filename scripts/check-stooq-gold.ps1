$ErrorActionPreference = 'Stop'

$uri = 'https://stooq.com/q/l/?s=gc.f&f=sd2t2ohlcv&h&e=csv'
$outFile = Join-Path $PSScriptRoot 'stooq-gold.out.txt'
$lines = New-Object System.Collections.Generic.List[string]
try {
  $res = Invoke-WebRequest -Uri $uri -UseBasicParsing
  $lines.Add(("status={0} len={1}" -f $res.StatusCode, $res.Content.Length))
  $headLen = [Math]::Min(400, $res.Content.Length)
  $lines.Add($res.Content.Substring(0, $headLen))
} catch {
  $lines.Add(("FAILED: {0}" -f $_.Exception.Message))
  $lines | Set-Content -Path $outFile -Encoding UTF8
  $lines | ForEach-Object { Write-Output $_ }
  exit 1
}

$lines | Set-Content -Path $outFile -Encoding UTF8
$lines | ForEach-Object { Write-Output $_ }
