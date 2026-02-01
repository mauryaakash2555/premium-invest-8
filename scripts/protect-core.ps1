<#
.SYNOPSIS
    Backup or restore core protected components

.DESCRIPTION
    This script creates/restores bulletproof backups of the core components:
    - Market Ticker
    - AI Chat
    - Admin Login

.PARAMETER Action
    "backup" - Create a new timestamped backup
    "restore" - Restore from most recent backup
    "list" - List available backups

.EXAMPLE
    .\protect-core.ps1 -Action backup
    .\protect-core.ps1 -Action restore
    .\protect-core.ps1 -Action list
#>

param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("backup", "restore", "list")]
    [string]$Action
)

$ErrorActionPreference = "Stop"

$ProjectRoot = "c:\Users\admin\premium-invest-8"
$BackupRoot = "c:\Users\admin\.bmwealth-safety-backups\core-protection"
$CoreDir = Join-Path $ProjectRoot "core"

# Ensure backup root exists
if (-not (Test-Path $BackupRoot)) {
    New-Item -ItemType Directory -Path $BackupRoot -Force | Out-Null
}

function Get-LatestBackup {
    $backups = Get-ChildItem -Path $BackupRoot -Directory | Sort-Object Name -Descending
    if ($backups.Count -eq 0) {
        return $null
    }
    return $backups[0].FullName
}

function Backup-Core {
    $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
    $backupDir = Join-Path $BackupRoot $timestamp
    
    Write-Host "Creating backup at: $backupDir" -ForegroundColor Cyan
    
    New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
    
    # Copy entire core directory
    Copy-Item -Path $CoreDir -Destination $backupDir -Recurse -Force
    
    # Also backup related files
    $relatedFiles = @(
        "app/(public)/page.jsx",
        "app/admin-secret-akash/page.jsx",
        "components/user/AIChatFloat.jsx",
        "components/user/AIChatFloat.module.css",
        "components/user/WhatsAppFloat.jsx",
        "components/user/PremiumMarketTicker.jsx",
        "components/user/PremiumMarketTicker.module.css",
        "lib/adminSession.js",
        "src/components/Chatbot3DTrigger.jsx",
        "public/spline/genkub/scene.splinecode",
        "DO_NOT_TOUCH_BOT.md"
    )
    
    $relatedDir = Join-Path $backupDir "related"
    New-Item -ItemType Directory -Path $relatedDir -Force | Out-Null
    
    foreach ($file in $relatedFiles) {
        $sourcePath = Join-Path $ProjectRoot $file
        if (Test-Path $sourcePath) {
            $destPath = Join-Path $relatedDir ($file -replace '/', '_')
            Copy-Item -Path $sourcePath -Destination $destPath -Force
        }
    }
    
    Write-Host "✅ Backup complete: $backupDir" -ForegroundColor Green
    Write-Host "Files backed up:" -ForegroundColor Yellow
    Get-ChildItem -Path $backupDir -Recurse -File | ForEach-Object { Write-Host "  - $($_.Name)" }
}

function Restore-Core {
    $latestBackup = Get-LatestBackup
    
    if (-not $latestBackup) {
        Write-Host "❌ No backups found!" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "Restoring from: $latestBackup" -ForegroundColor Cyan
    
    # Remove current core directory
    if (Test-Path $CoreDir) {
        Remove-Item -Path $CoreDir -Recurse -Force
    }
    
    # Copy from backup
    $backupCoreDir = Join-Path $latestBackup "core"
    if (Test-Path $backupCoreDir) {
        Copy-Item -Path $backupCoreDir -Destination $CoreDir -Recurse -Force
        Write-Host "✅ Core directory restored" -ForegroundColor Green
    } else {
        Write-Host "⚠️ No core directory in backup" -ForegroundColor Yellow
    }
    
    Write-Host "✅ Restore complete!" -ForegroundColor Green
    Write-Host "⚠️ Restart your dev server to apply changes" -ForegroundColor Yellow
}

function List-Backups {
    $backups = Get-ChildItem -Path $BackupRoot -Directory | Sort-Object Name -Descending
    
    if ($backups.Count -eq 0) {
        Write-Host "No backups found." -ForegroundColor Yellow
        return
    }
    
    Write-Host "Available backups:" -ForegroundColor Cyan
    foreach ($backup in $backups) {
        $fileCount = (Get-ChildItem -Path $backup.FullName -Recurse -File).Count
        Write-Host "  📁 $($backup.Name) ($fileCount files)" -ForegroundColor White
    }
}

# Execute action
switch ($Action) {
    "backup" { Backup-Core }
    "restore" { Restore-Core }
    "list" { List-Backups }
}
