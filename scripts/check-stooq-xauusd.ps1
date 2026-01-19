$ErrorActionPreference = 'Stop'

$uri = 'https://stooq.com/q/l/?s=xauusd&f=sd2t2ohlcv&h&e=csv'
$outFile = Join-Path $PSScriptRoot 'stooq-xauusd.out.txt'
$res = Invoke-WebRequest -Uri $uri -UseBasicParsing
"status=$($res.StatusCode) len=$($res.Content.Length)" | Set-Content -Path $outFile -Encoding UTF8
$res.Content | Add-Content -Path $outFile -Encoding UTF8
$res.Content | Write-Output
