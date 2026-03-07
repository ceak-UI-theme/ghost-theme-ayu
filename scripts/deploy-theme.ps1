param(
    [string]$GhostDevPath = "D:\workspace\02.works\ghost-dev",
    [string]$ThemeName = "signal-wave-ayu",
    [switch]$RestartDocker
)

$ErrorActionPreference = "Stop"
$repoRoot = Split-Path -Parent $PSScriptRoot

Write-Host "[1/5] Build theme assets" -ForegroundColor Cyan
Push-Location $repoRoot
npx gulp build

Write-Host "[2/5] Create theme zip" -ForegroundColor Cyan
npm run zip

$zipPath = Join-Path $repoRoot ("dist\{0}.zip" -f $ThemeName)
if (!(Test-Path $zipPath)) {
    throw "Theme zip not found: $zipPath"
}

$themeTarget = Join-Path $GhostDevPath ("content\themes\{0}" -f $ThemeName)

Write-Host "[3/5] Extract zip to Ghost themes path" -ForegroundColor Cyan
if (Test-Path $themeTarget) {
    Remove-Item -Recurse -Force $themeTarget
}
New-Item -ItemType Directory -Path $themeTarget -Force | Out-Null
Expand-Archive -Path $zipPath -DestinationPath $themeTarget -Force

if ($RestartDocker) {
    Write-Host "[4/5] Restart docker compose" -ForegroundColor Cyan
    Push-Location $GhostDevPath
    docker compose down
    docker compose up -d
    Pop-Location
}

Write-Host "[5/5] Done" -ForegroundColor Green
Write-Host ("Zip: {0}" -f $zipPath)
Write-Host ("Theme path: {0}" -f $themeTarget)

if (!$RestartDocker) {
    Write-Host "Tip: add -RestartDocker to reload Ghost containers automatically."
}

Pop-Location
