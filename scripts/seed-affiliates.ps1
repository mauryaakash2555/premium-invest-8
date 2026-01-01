# Seed placeholder affiliate links into Supabase (staging)
# Prompts for secrets so you don't paste them into terminal history.

$ErrorActionPreference = "Stop"

Write-Host "\n=== Seed Affiliate Links (Supabase) ===\n"

$projectUrl = Read-Host "Enter NEXT_PUBLIC_SUPABASE_URL (example: https://xxxx.supabase.co)"
if (-not $projectUrl) { throw "NEXT_PUBLIC_SUPABASE_URL is required." }

$projectUrl = $projectUrl.Trim()
if ($projectUrl.EndsWith("/")) { $projectUrl = $projectUrl.TrimEnd("/") }

$secureKey = Read-Host "Enter SUPABASE_SERVICE_ROLE_KEY (input hidden)" -AsSecureString
if (-not $secureKey) { throw "SUPABASE_SERVICE_ROLE_KEY is required." }

# Convert SecureString -> plain text (required to pass to node process env)
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureKey)
try {
  $plainKey = [System.Runtime.InteropServices.Marshal]::PtrToStringBSTR($BSTR)
} finally {
  [System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($BSTR)
}

$env:NEXT_PUBLIC_SUPABASE_URL = $projectUrl
$env:SUPABASE_SERVICE_ROLE_KEY = $plainKey.Trim()

Write-Host "\nChecking Supabase connectivity + permissions..." -ForegroundColor Cyan
$headers = @{
  apikey        = $env:SUPABASE_SERVICE_ROLE_KEY
  Authorization = "Bearer $($env:SUPABASE_SERVICE_ROLE_KEY)"
}

try {
  $health = Invoke-RestMethod -Method Get -Uri ("{0}/auth/v1/health" -f $projectUrl) -Headers $headers -TimeoutSec 15
  if ($health -and $health.status) {
    Write-Host ("Auth health OK: status={0}" -f $health.status) -ForegroundColor Green
  } else {
    Write-Host "Auth health OK." -ForegroundColor Green
  }
} catch {
  Write-Host "Auth health check failed." -ForegroundColor Red
  Write-Host "- Double-check the Project URL and that you pasted the STAGING service_role key." -ForegroundColor Yellow
  Write-Host ("Details: {0}" -f ($_.Exception.Message)) -ForegroundColor DarkGray
  throw
}

try {
  # Verify PostgREST access and that the affiliate table exists.
  # If schema not applied yet, you'll see a 404/400 style error.
  $null = Invoke-RestMethod -Method Get -Uri ("{0}/rest/v1/affiliate_links?select=id&limit=1" -f $projectUrl) -Headers $headers -TimeoutSec 15
  Write-Host "Table check OK: affiliate_links is reachable." -ForegroundColor Green
} catch {
  Write-Host "Table check failed: affiliate_links not reachable." -ForegroundColor Red
  Write-Host "- If you haven't run the SQL yet, run supabase/schema.sql in the STAGING Supabase SQL Editor first." -ForegroundColor Yellow
  Write-Host "- If you did run it, verify you ran it in the correct (STAGING) Supabase project." -ForegroundColor Yellow
  Write-Host ("Details: {0}" -f ($_.Exception.Message)) -ForegroundColor DarkGray
  throw
}

Write-Host "\nRunning seed script..." -ForegroundColor Cyan
try {
  node (Join-Path $PSScriptRoot "seed-affiliates.js")
} finally {
  # best-effort cleanup (won't erase from your clipboard/history, but avoids accidental re-use)
  $plainKey = $null
}

Write-Host "\nDone." -ForegroundColor Green
