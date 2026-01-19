$ErrorActionPreference = 'Stop'

$uri = 'https://www.goodreturns.in/gold-rates/'
$outFile = Join-Path $PSScriptRoot 'goodreturns-gold.out.txt'
try {
	$res = Invoke-WebRequest -Uri $uri -UseBasicParsing
	"status=$($res.StatusCode) len=$($res.Content.Length)" | Set-Content -Path $outFile -Encoding UTF8
	$headLen = [Math]::Min(600, $res.Content.Length)
	$res.Content.Substring(0,$headLen) | Add-Content -Path $outFile -Encoding UTF8
	$res.Content.Substring(0,$headLen) | Write-Output
} catch {
	("FAILED: {0}" -f $_.Exception.Message) | Set-Content -Path $outFile -Encoding UTF8
	Write-Output ("FAILED: {0}" -f $_.Exception.Message)
	exit 1
}
