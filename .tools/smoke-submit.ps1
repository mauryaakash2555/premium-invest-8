param(
  [string]$BaseUrl = 'http://127.0.0.1:3000'
)

$ErrorActionPreference = 'Stop'

function Invoke-Json {
  param(
    [string]$Method,
    [string]$Url,
    [object]$Body = $null
  )

  $headers = @{ 'Accept' = 'application/json' }
  if ($null -ne $Body) {
    $headers['Content-Type'] = 'application/json'
    $json = $Body | ConvertTo-Json -Depth 20 -Compress
    return Invoke-RestMethod -Method $Method -Uri $Url -Headers $headers -Body $json
  }

  return Invoke-RestMethod -Method $Method -Uri $Url -Headers $headers
}

Write-Output ('BaseUrl: ' + $BaseUrl)

Write-Output "\n--- Submit Impact"
$impact = @{
  title = 'Smoke Test Impact Submission'
  what_happened = ('This is a smoke-test story body. ' * 3)
  when_happened = '2026-02-03'
  where_happened = 'Mumbai'
  who_affected = 'Residents'
  evidence_proof = 'N/A'
  impact_result = ('Clear impact result details. ' * 2)
  author_name = 'Tester'
  author_email = 'tester@example.com'
  location_tag = 'Mumbai'
  anonymous = $false
}
try {
  $r1 = Invoke-Json -Method POST -Url "$BaseUrl/api/submit/impact" -Body $impact
  Write-Output ("impact.ok=" + $r1.ok)
  if ($r1.email) { Write-Output ("impact.email.status=" + $r1.email.status + ", reason=" + $r1.email.reason) }
} catch {
  Write-Output ("impact.error=" + $_.Exception.Message)
}

Write-Output "\n--- Submit Guest"
$guest = @{
  title = 'Smoke Test Guest Column'
  article_content = ('This is a long guest article content section. ' * 10)
  expertise_area = 'Investing'
  author_name = 'Tester'
  author_credentials = 'CFA'
  author_bio = ('Short bio for smoke testing. ' * 2)
  author_linkedin = 'https://www.linkedin.com/in/example'
  author_email = 'tester@example.com'
  sources_references = 'N/A'
}
try {
  $r2 = Invoke-Json -Method POST -Url "$BaseUrl/api/submit/guest" -Body $guest
  Write-Output ("guest.ok=" + $r2.ok)
  if ($r2.email) { Write-Output ("guest.email.status=" + $r2.email.status + ", reason=" + $r2.email.reason) }
} catch {
  Write-Output ("guest.error=" + $_.Exception.Message)
}
