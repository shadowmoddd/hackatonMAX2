$ErrorActionPreference = "Stop"
$ProjectRoot = $PSScriptRoot

Write-Host "====================================" -ForegroundColor Cyan
Write-Host "  Progressors Mini App Deploy" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan

# 1. Build
Write-Host "[1/3] Building..." -ForegroundColor Yellow
Set-Location "$ProjectRoot\miniapp"
npm run build
if ($LASTEXITCODE -ne 0) { Write-Host "Build failed!" -ForegroundColor Red; exit 1 }
Write-Host "    Build OK" -ForegroundColor Green

# 2. Deploy (interactive - user can login and see output)
Write-Host "[2/3] Deploying to Vercel (follow prompts)..." -ForegroundColor Yellow
npx vercel --prod --yes
if ($LASTEXITCODE -ne 0) { Write-Host "Deploy failed!" -ForegroundColor Red; exit 1 }

# 3. Get URL
Write-Host ""
$url = Read-Host "Paste the deployed URL from above (https://...vercel.app)"

if (-not $url.StartsWith("https://")) {
    Write-Host "Invalid URL" -ForegroundColor Red; exit 1
}

# 4. Write to .env
Write-Host "[3/3] Updating .env..." -ForegroundColor Yellow
Set-Location $ProjectRoot

$envFile = "$ProjectRoot\.env"
$envContent = [System.IO.File]::ReadAllText($envFile, [System.Text.Encoding]::UTF8)

if ($envContent -match "MINIAPP_URL=") {
    $envContent = $envContent -replace "MINIAPP_URL=.*", "MINIAPP_URL=$url"
} else {
    $envContent = $envContent.TrimEnd() + "`r`nMINIAPP_URL=$url`r`n"
}

[System.IO.File]::WriteAllText($envFile, $envContent, [System.Text.Encoding]::UTF8)

Write-Host ""
Write-Host "====================================" -ForegroundColor Green
Write-Host "  Done! $url" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green
Write-Host "Now run: python -m bot.main" -ForegroundColor Cyan
