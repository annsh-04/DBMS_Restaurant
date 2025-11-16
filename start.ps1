# Chef Chatter - Start everything with one command
# This script starts both backend and frontend servers

Write-Host "🍽️  Starting Chef Chatter..." -ForegroundColor Green
Write-Host ""

# Get the script directory (project root)
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$backendDir = Join-Path $projectRoot "backend"

# Define script blocks for background jobs
$backendScript = {
    param($backendDir)
    Set-Location $backendDir
    Write-Host "📡 Starting backend server (port 3000)..." -ForegroundColor Cyan
    & node server.js
}

$frontendScript = {
    param($projectRoot)
    Set-Location $projectRoot
    Write-Host "⚛️  Starting frontend (port 8080)..." -ForegroundColor Cyan
    & npm run dev
}

# Start both in parallel
Write-Host "Launching backend and frontend..." -ForegroundColor Cyan
$backend = Start-Job -ScriptBlock $backendScript -ArgumentList $backendDir -Name "Backend"
$frontend = Start-Job -ScriptBlock $frontendScript -ArgumentList $projectRoot -Name "Frontend"

Write-Host ""
Write-Host "✅ Both servers are starting..." -ForegroundColor Green
Write-Host ""
Write-Host "📍 Backend:  http://localhost:3000" -ForegroundColor Yellow
Write-Host "📍 Frontend: http://localhost:8080" -ForegroundColor Yellow
Write-Host ""
Write-Host "To stop, press Ctrl+C or run: taskkill /IM node.exe /F" -ForegroundColor Gray
Write-Host ""

# Keep waiting for jobs
while ($true) {
    $bJob = Get-Job -Name "Backend" -ErrorAction SilentlyContinue
    $fJob = Get-Job -Name "Frontend" -ErrorAction SilentlyContinue
    
    if (($null -eq $bJob -or $bJob.State -eq "Completed") -and `
        ($null -eq $fJob -or $fJob.State -eq "Completed")) {
        break
    }
    
    Start-Sleep -Seconds 1
}

# Cleanup
Stop-Job -Name "Backend" -ErrorAction SilentlyContinue
Stop-Job -Name "Frontend" -ErrorAction SilentlyContinue
Remove-Job -Name "Backend" -ErrorAction SilentlyContinue
Remove-Job -Name "Frontend" -ErrorAction SilentlyContinue
