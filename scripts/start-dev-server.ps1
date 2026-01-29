[CmdletBinding()]
param(
  [int]$Port = 3000,
  [int]$TimeoutSeconds = 30,
  [switch]$ForceRestart
)

$ErrorActionPreference = 'Stop'

$AppRoot = Resolve-Path (Join-Path $PSScriptRoot '..')
$StdOut = Join-Path $AppRoot 'dev_out.log'
$StdErr = Join-Path $AppRoot 'dev_err.log'

function Test-UrlOk([string]$Url, [int]$TimeoutSec = 2) {
  try {
    $r = Invoke-WebRequest -Uri $Url -Method Get -TimeoutSec $TimeoutSec -UseBasicParsing
    return ($r.StatusCode -ge 200 -and $r.StatusCode -lt 500)
  } catch {
    return $false
  }
}

function Test-NextClientAssets([int]$LocalPort) {
  $base = "http://localhost:$LocalPort"

  # (1) Webpack runtime chunk (should exist in dev)
  if (-not (Test-UrlOk -Url "$base/_next/static/chunks/webpack.js" -TimeoutSec 2)) {
    return $false
  }

  # (2) CSS in dev is sometimes served under a non-hashed path.
  # Check the common layout.css endpoint; if it's missing, warm up '/' once
  # (first request can trigger compilation) and re-check.
  $layoutCss = "$base/_next/static/css/app/layout.css"
  if (-not (Test-UrlOk -Url $layoutCss -TimeoutSec 3)) {
    try {
      # Warm up compilation (avoid failing just because CSS hasn't been emitted yet).
      Invoke-WebRequest -Uri "$base/" -Method Get -TimeoutSec 8 -UseBasicParsing | Out-Null
    } catch {}

    if (-not (Test-UrlOk -Url $layoutCss -TimeoutSec 3)) {
      # Fallback: try the first CSS URL referenced by the homepage HTML.
      try {
        $home = Invoke-WebRequest -Uri "$base/" -Method Get -TimeoutSec 8 -UseBasicParsing
        $html = [string]$home.Content
        $m = [regex]::Match($html, '/_next/static/css/[^"\s]+')
        if ($m.Success) {
          $cssUrl = "$base$($m.Value)"
          if (-not (Test-UrlOk -Url $cssUrl -TimeoutSec 3)) {
            return $false
          }
        }
      } catch {
        return $false
      }
    }
  }

  return $true
}

function Get-ListeningPid([int]$LocalPort) {
  try {
    $conns = Get-NetTCPConnection -LocalPort $LocalPort -State Listen -ErrorAction Stop
    if ($null -ne $conns) { return @($conns | Select-Object -ExpandProperty OwningProcess) }
  } catch {
    return @()
  }
  return @()
}

$existingPids = @(Get-ListeningPid -LocalPort $Port | Where-Object { $_ -and $_ -gt 0 } | Select-Object -Unique)
if ($existingPids -and $existingPids.Count -gt 0) {
  $readyUrl = "http://localhost:$Port/"
  try {
    $r = Invoke-WebRequest -Uri $readyUrl -Method Get -TimeoutSec 4 -UseBasicParsing
    if ($r.StatusCode -ge 200 -and $r.StatusCode -lt 500) {
      if (Test-NextClientAssets -LocalPort $Port) {
        Write-Host "READY http://localhost:$Port/"
        exit 0
      }

      if (-not $ForceRestart) {
        Write-Error "Port $Port is already in use and http://localhost:$Port/ responds, but critical Next client assets appear broken (e.g., CSS/webpack chunks 404). Refusing to kill unknown process(es). Run stop-dev task or re-run with -ForceRestart. PIDs: $($existingPids -join ', ')"
        exit 1
      }
    }
  } catch {
    # Not responding; decide whether to restart.
  }

  if (-not $ForceRestart) {
    Write-Error "Port $Port is already in use but http://localhost:$Port/ did not respond. Refusing to kill unknown process(es). Run stop-dev task or re-run with -ForceRestart, or choose a different port. PIDs: $($existingPids -join ', ')"
    exit 1
  }

  foreach ($existingPid in $existingPids) {
    try { Stop-Process -Id $existingPid -Force -ErrorAction SilentlyContinue } catch {}
  }
  Start-Sleep -Milliseconds 300
}

# Clear potentially stale build artifacts that can confuse webviews (VS Code Simple Browser)
# and cause webpack runtime errors after restarts.
try {
  $nextDir = Join-Path $AppRoot '.next'
  if (Test-Path $nextDir) {
    $routesManifest = Join-Path $nextDir 'routes-manifest.json'
    $webpackRuntime = Join-Path $nextDir 'server\webpack-runtime.js'

    $hardClean = $false
    if ($ForceRestart) { $hardClean = $true }
    if ((Test-Path $webpackRuntime) -and -not (Test-Path $routesManifest)) {
      # We've observed corrupted partial .next states where Next dev serves HTML,
      # but critical client bundles like main-app.js / layout.css 404.
      $hardClean = $true
    }

    if ($hardClean) {
      try { Remove-Item -Recurse -Force $nextDir -ErrorAction SilentlyContinue } catch {}
    } else {
      try { Remove-Item -Recurse -Force (Join-Path $nextDir 'cache') -ErrorAction SilentlyContinue } catch {}
      try { Remove-Item -Recurse -Force (Join-Path $nextDir 'static') -ErrorAction SilentlyContinue } catch {}
    }
  }
} catch {}

# Start Next dev server detached, so the task can finish once it is ready.
# Use npx so the requested -Port is honored (package.json dev script is pinned to 3000).
$maxAttempts = 2
for ($attempt = 1; $attempt -le $maxAttempts; $attempt++) {
  $cmd = "cd /d `"$AppRoot`" && npx.cmd next dev -p $Port"
  $proc = Start-Process -FilePath 'cmd.exe' -ArgumentList @('/c', $cmd) -WorkingDirectory $AppRoot -WindowStyle Hidden -RedirectStandardOutput $StdOut -RedirectStandardError $StdErr -PassThru

  $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
  $readyUrl = "http://localhost:$Port/"

  while ((Get-Date) -lt $deadline) {
    if (Test-UrlOk -Url $readyUrl -TimeoutSec 2) {
      break
    }
    Start-Sleep -Milliseconds 250
  }

  if (-not (Test-UrlOk -Url $readyUrl -TimeoutSec 4)) {
    try { Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue } catch {}
    if ($attempt -lt $maxAttempts) {
      try { Remove-Item -Recurse -Force (Join-Path $AppRoot '.next') -ErrorAction SilentlyContinue } catch {}
      continue
    }
    Write-Error "Dev server did not become ready in ${TimeoutSeconds}s. Check logs: $StdOut and $StdErr"
    exit 1
  }

  # If the server responds but assets are corrupted (common Next dev partial-state issue), recover once.
  if (Test-NextClientAssets -LocalPort $Port) {
    Write-Host "READY http://localhost:$Port/"
    exit 0
  }

  try { Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue } catch {}
  try { Remove-Item -Recurse -Force (Join-Path $AppRoot '.next') -ErrorAction SilentlyContinue } catch {}
  Start-Sleep -Milliseconds 400
}

Write-Error "Dev server responded but Next client assets remained broken after recovery. Check logs: $StdOut and $StdErr"
exit 1
