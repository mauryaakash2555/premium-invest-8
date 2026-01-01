$ErrorActionPreference = "Stop"
function Assert-Git { if ($LASTEXITCODE -ne 0) { throw "Git failed." } }

Write-Host ">>> Switching to project..."
Set-Location "$PSScriptRoot" # Use the script's own directory for safety

Write-Host ">>> Checking out main..."
git checkout main --quiet; Assert-Git

Write-Host ">>> Pulling latest from origin..."
git pull origin main --quiet; Assert-Git

Write-Host ">>> Merging staging → main..."
git merge staging --quiet; Assert-Git

Write-Host ">>> Publishing to GitHub..."
git push origin main --quiet; Assert-Git

Write-Host ">>> MAIN IS NOW LIVE!"
