$ErrorActionPreference = 'Stop'

$outPath = Join-Path (Get-Location) '.tmp_qa_sip_vs_panic.log'
try { Stop-Transcript | Out-Null } catch { }
Start-Transcript -Path $outPath -Force | Out-Null

$base = 'http://localhost:3000'

Write-Host '--- /intelligence'
curl.exe -sI "$base/intelligence" | Select-String -Pattern '^(HTTP/|location:)' | ForEach-Object { $_.Line }

Write-Host '--- /intelligence/sip-vs-panic'
curl.exe -sI "$base/intelligence/sip-vs-panic" | Select-String -Pattern '^(HTTP/|location:)' | ForEach-Object { $_.Line }

Write-Host '--- json-ld present?'
$html = curl.exe -s "$base/intelligence/sip-vs-panic"
Write-Host ("jsonLd=" + ($html | Select-String -Pattern 'application/ld\+json' -Quiet))

Write-Host '--- OG endpoint status'
$og = curl.exe -s -D - -o NUL "$base/api/og/sip-vs-panic?m=10000&y=10&cost=100000&disc=1&panic=0&tax=equity";
$og | Select-String -Pattern '^HTTP/' | Select-Object -First 1 | ForEach-Object { $_.Line }

Write-Host '--- Challenge share OG tags present?'
$challengeHtml = curl.exe -s "$base/intelligence/sip-vs-panic?share=1&story=1&challenge=1&chc=stop&m=10000&y=10"
Write-Host ("challengeOgImage=" + ($challengeHtml | Select-String -Pattern 'og:image' -Quiet))
Write-Host ("challengeOgMode=" + ($challengeHtml | Select-String -Pattern 'mode=challenge' -Quiet))

Write-Host '--- Challenge OG endpoint status'
$ogChallenge = curl.exe -s -D - -o NUL "$base/api/og/sip-vs-panic?mode=challenge&chc=stop&m=10000&y=10";
$ogChallenge | Select-String -Pattern '^HTTP/' | Select-Object -First 1 | ForEach-Object { $_.Line }

Stop-Transcript | Out-Null
