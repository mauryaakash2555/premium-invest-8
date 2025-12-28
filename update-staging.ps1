# Stop on PowerShell errors
$ErrorActionPreference = "Stop"

function Assert-Git { if ($LASTEXITCODE -ne 0) { throw "Git failed." } }

Write-Host ">>> Switching to project..."
# Set-Location "$([Environment]::GetFolderPath('Desktop'))\premium-invest-8"
Set-Location "$PSScriptRoot" # Use the script's own directory for safety

Write-Host ">>> Updating main..."
git checkout main --quiet; Assert-Git
git pull origin main --quiet; Assert-Git

Write-Host ">>> Creating or switching to staging..."
if (git rev-parse --verify staging 2>$null) {
    git checkout staging --quiet
} else {
    git checkout -b staging --quiet
}
Assert-Git

Write-Host ">>> Sync staging with main..."
git merge main --quiet
Assert-Git

Write-Host ">>> Creating README-staging.txt..."
"staging branch for premium-invest-8" | Out-File -Encoding utf8 README-staging.txt

Write-Host ">>> Checking for changes..."
if (git status --porcelain) {
    git add .
    git commit -m "auto-update staging" --quiet
    git push -u origin staging --quiet
    Write-Host ">>> Changes pushed to staging."
} else {
    Write-Host ">>> No changes to commit. Skipped commit."
}

Write-Host ">>> DONE."
