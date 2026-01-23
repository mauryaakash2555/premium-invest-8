$ErrorActionPreference = 'Stop'

$base = 'http://localhost:3000'
$outFile = Join-Path $PSScriptRoot '..\.tmp_qa_sip_v_panic.txt'

$lines = New-Object System.Collections.Generic.List[string]

function Add-Lines([string] $header, [string[]] $payload) {
	$lines.Add($header) | Out-Null
	foreach ($l in ($payload | Where-Object { $_ })) { $lines.Add($l) | Out-Null }
	$lines.Add('') | Out-Null
}

Add-Lines '--- redirect sip-vs-panic-selling' (
	curl.exe -sI "$base/intelligence/sip-vs-panic-selling" |
		Select-String -Pattern '^(HTTP/|location:)' |
		ForEach-Object { $_.Line }
)

Add-Lines '--- redirect sip-vs-panic-simulator' (
	curl.exe -sI "$base/intelligence/sip-vs-panic-simulator" |
		Select-String -Pattern '^(HTTP/|location:)' |
		ForEach-Object { $_.Line }
)

Add-Lines '--- redirect stop-sip-during-crash' (
	curl.exe -sI "$base/intelligence/stop-sip-during-crash" |
		Select-String -Pattern '^(HTTP/|location:)' |
		ForEach-Object { $_.Line }
)

Add-Lines '--- canonical status' @(
	(curl.exe -sI "$base/intelligence/sip-vs-panic" | Select-String -Pattern '^HTTP/' | Select-Object -First 1).Line
)

$html = curl.exe -s "$base/intelligence/sip-vs-panic"
$hasJsonLd = $false
try {
	$hasJsonLd = $html | Select-String -Pattern 'application/ld\+json' -Quiet
} catch {
	$hasJsonLd = $false
}
Add-Lines '--- json-ld present?' @("jsonLd=$hasJsonLd")

$headers = curl.exe -s -D - -o NUL -X POST "$base/api/events" -H 'Content-Type: application/json' -d '{"event_type":"calculator_view","data":{"calculator_type":"sip_vs_panic_selling"}}'
$statusLine = ($headers | Select-String -Pattern '^HTTP/' | Select-Object -First 1).Line
Add-Lines '--- api/events status' @($statusLine)

$lines | Set-Content -Encoding UTF8 $outFile
Write-Host ("Wrote QA report: $outFile")
