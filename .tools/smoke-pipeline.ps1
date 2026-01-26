param(
  [string]$BaseUrl = 'http://localhost:3000'
)

$ErrorActionPreference = 'Stop'

function Invoke-Json {
  param(
    [string]$Method,
    [string]$Url,
    [object]$Body = $null
  )

  $headers = @{ 'Accept' = 'application/json' }
  if ($Body -ne $null) {
    $headers['Content-Type'] = 'application/json'
    $json = $Body | ConvertTo-Json -Depth 20 -Compress
    return Invoke-RestMethod -Method $Method -Uri $Url -Headers $headers -Body $json
  }

  return Invoke-RestMethod -Method $Method -Uri $Url -Headers $headers
}

Write-Host ('BaseUrl: ' + $BaseUrl)

Write-Host '\n--- Health'
$health = Invoke-Json -Method GET -Url "$BaseUrl/api/health"
$ai = $health.checks.ai
Write-Host ("health.ok=" + $health.ok)
Write-Host ("ai.gemini=" + $ai.gemini.configured + ", ai.groq=" + $ai.groq.configured + ", ai.anthropic=" + $ai.anthropic.configured + ", ai.mistral=" + $ai.mistral.configured)

Write-Host '\n--- Chat'
$chat = Invoke-Json -Method POST -Url "$BaseUrl/api/chat" -Body @{ message = 'hello'; mode = 'user' }
Write-Host ("chat.ok=" + $chat.ok)
Write-Host ("reply.preview=" + (($chat.reply | Out-String).Trim().Substring(0, [Math]::Min(120, (($chat.reply | Out-String).Trim()).Length))))

Write-Host '\n--- AI Summary'
# Use Invoke-WebRequest to read response headers (x-ai-provider)
$payload = @{ type = 'morning'; prompt = 'Return ONLY JSON with keys: title (string), overallTone (string)'; context = @{}; systemPrompt = 'Return valid JSON only.' }
$resp = Invoke-WebRequest -Method POST -Uri "$BaseUrl/api/ai/generate-summary" -Headers @{ 'Content-Type' = 'application/json' } -Body ($payload | ConvertTo-Json -Depth 20 -Compress)
$provider = $resp.Headers['x-ai-provider']
Write-Host ("x-ai-provider=" + $provider)
Write-Host ("summary.preview=" + ($resp.Content.Substring(0, [Math]::Min(200, $resp.Content.Length))))

Write-Host '\n--- Leads (best-effort)'
try {
  $leads = Invoke-Json -Method POST -Url "$BaseUrl/api/leads" -Body @{ name = 'Test'; email = 'test@example.com'; phone = '9999999999' }
  Write-Host ("leads.ok=" + $leads.ok)
} catch {
  Write-Host ("leads.error=" + $_.Exception.Message)
}

Write-Host '\n--- Track (best-effort)'
try {
  $track = Invoke-Json -Method POST -Url "$BaseUrl/api/track" -Body @{ event_type = 'smoke_test'; data = @{ from = 'smoke-pipeline.ps1' } }
  if ($track -and $track.ok -ne $null) {
    Write-Host ("track.ok=" + $track.ok)
  } else {
    Write-Host 'track.responded=true'
  }
} catch {
  Write-Host ("track.error=" + $_.Exception.Message)
}
