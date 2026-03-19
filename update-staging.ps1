# Stop on PowerShell errors
$ErrorActionPreference = "Stop"

function Assert-Git { if ($LASTEXITCODE -ne 0) { throw "Git failed." } }
function Test-GitRef {
  param(
    [Parameter(Mandatory = $true)]
    [string]$RefName
  )

  $gitDir = Join-Path $PSScriptRoot ".git"
  $directRef = Join-Path $gitDir ($RefName -replace '/', '\')
  if (Test-Path $directRef) {
    return $true
  }

  $packedRefs = Join-Path $gitDir "packed-refs"
  if (-not (Test-Path $packedRefs)) {
    return $false
  }

  $pattern = [regex]::Escape($RefName) + '$'
  return [bool](Select-String -Path $packedRefs -Pattern $pattern -Quiet)
}

Write-Host "🚀 Deploying to Staging..." -ForegroundColor Cyan
Write-Host ">>> Switching to project..."
Set-Location "$PSScriptRoot" # Use the script's own directory for safety

Write-Host "1️⃣ Creating backup..." -ForegroundColor Yellow
node .\scripts\safety\chat-backup.js backup
if ($LASTEXITCODE -ne 0) { throw "Chat backup failed." }

Write-Host "2️⃣ Running validations..." -ForegroundColor Yellow
node .\scripts\validate-all.js
if ($LASTEXITCODE -ne 0) {
  Write-Host "❌ Validation failed! Aborting deployment." -ForegroundColor Red
  exit 1
}

Write-Host "3️⃣ Running tests..." -ForegroundColor Yellow
npm test
if ($LASTEXITCODE -ne 0) {
  Write-Host "❌ Tests failed! Aborting deployment." -ForegroundColor Red
  exit 1
}

Write-Host "4️⃣ Building..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
  Write-Host "❌ Build failed! Aborting deployment." -ForegroundColor Red
  exit 1
}

Write-Host "5️⃣ Updating main..." -ForegroundColor Yellow
git checkout main --quiet; Assert-Git
git pull origin main --quiet; Assert-Git

Write-Host "6️⃣ Creating or switching to staging..." -ForegroundColor Yellow
$stagingExists = Test-GitRef "refs/heads/staging"
if ($stagingExists) {
  git checkout staging --quiet
} else {
  git checkout -b staging --quiet
}
Assert-Git

Write-Host "7️⃣ Sync staging with main..." -ForegroundColor Yellow
git merge main --quiet
Assert-Git

Write-Host "8️⃣ Checking for local working tree changes..." -ForegroundColor Yellow
if (git status --porcelain) {
  git add .
  git commit -m "auto-update staging" --quiet
  Assert-Git
}

Write-Host "9️⃣ Pushing staging branch..." -ForegroundColor Yellow
git fetch origin --quiet
Assert-Git

$originStagingExists = Test-GitRef "refs/remotes/origin/staging"
if ($originStagingExists) {
  $ahead = (git rev-list --count origin/staging..staging).Trim()
  if ($ahead -ne "0") {
    git push origin staging --quiet
    Assert-Git
    Write-Host "✅ Deployment complete! Pushed $ahead commit(s) to origin/staging." -ForegroundColor Green
  } else {
    Write-Host ">>> Staging already up to date. Skipped push." -ForegroundColor Gray
  }
} else {
  git push -u origin staging --quiet
  Assert-Git
  Write-Host "✅ Deployment complete! Pushed new origin/staging branch." -ForegroundColor Green
}

Write-Host "🌐 Check your staging deployment in Vercel (staging branch)." -ForegroundColor Cyan
