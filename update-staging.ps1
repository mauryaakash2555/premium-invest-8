# Stop on PowerShell errors
$ErrorActionPreference = "Stop"

function Assert-Git { if ($LASTEXITCODE -ne 0) { throw "Git failed." } }

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
if (git rev-parse --verify staging 2>$null) {
  git checkout staging --quiet
} else {
  git checkout -b staging --quiet
}
Assert-Git

Write-Host "7️⃣ Sync staging with main..." -ForegroundColor Yellow
git merge main --quiet
Assert-Git

Write-Host "8️⃣ Checking for changes..." -ForegroundColor Yellow
if (git status --porcelain) {
  git add .
  git commit -m "auto-update staging" --quiet
  git push -u origin staging --quiet
  Write-Host "✅ Deployment complete!" -ForegroundColor Green
} else {
  Write-Host ">>> No changes to commit. Skipped push." -ForegroundColor Gray
}

Write-Host "🌐 Check your staging deployment in Vercel (staging branch)." -ForegroundColor Cyan
