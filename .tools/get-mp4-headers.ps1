$ErrorActionPreference = 'Stop'

$uri = 'https://fuselabcreative.com/wp-content/uploads/2025/12/managing-stadium-events.mp4'
$outFile = Join-Path (Get-Location) '.tmp_mp4_headers.txt'

try {
    $resp = Invoke-WebRequest -Uri $uri -Method Head -MaximumRedirection 5 -TimeoutSec 30

    $lines = @(
        "StatusCode: $($resp.StatusCode)",
        "FinalUri: $($resp.BaseResponse.ResponseUri)",
        "ContentType: $($resp.Headers.'Content-Type')",
        "ContentLength: $($resp.Headers.'Content-Length')"
    )

    foreach ($key in ($resp.Headers.Keys | Sort-Object)) {
        $lines += "$($key): $($resp.Headers[$key])"
    }

    $lines | Set-Content -Encoding UTF8 $outFile
}
catch {
    "ERROR: $($_.Exception.Message)" | Set-Content -Encoding UTF8 $outFile
}
