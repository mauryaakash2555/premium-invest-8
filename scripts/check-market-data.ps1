$ErrorActionPreference = 'Stop'

$uri = 'http://localhost:3000/api/market-data?nocache=1'
$r = Invoke-RestMethod -Uri $uri -Method GET -Headers @{ 'Cache-Control'='no-cache' }

$outFile = Join-Path $PSScriptRoot 'market-data.out.txt'
$lines = New-Object System.Collections.Generic.List[string]

$lines.Add(("ok={0} source={1} count={2}" -f $r.ok, $r.source, ($r.items | Measure-Object).Count))

foreach ($it in $r.items) {
  $id = $it.id
  $val = $it.value
  $live = $it.live
  $up = $it.updating
  $src = $it.source
  $lines.Add(("{0}={1} live={2} updating={3} source={4}" -f $id, $val, $live, $up, $src))
}

$lines | Set-Content -Path $outFile -Encoding UTF8
$lines | ForEach-Object { Write-Output $_ }
