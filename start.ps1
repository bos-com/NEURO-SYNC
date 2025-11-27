Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Starting NeuroSync Project" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Start server in new window
Write-Host "Starting Server on port 5001..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\server'; Write-Host 'NeuroSync Server Starting...' -ForegroundColor Green; npm start" -WindowStyle Normal

# Wait a bit for server to start
Start-Sleep -Seconds 3

# Start client in new window
Write-Host "Starting Client on port 3000..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\client'; Write-Host 'NeuroSync Client Starting...' -ForegroundColor Green; npm start" -WindowStyle Normal

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Both services are starting!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Server: http://localhost:5001" -ForegroundColor Yellow
Write-Host "Client: http://localhost:3000" -ForegroundColor Yellow
Write-Host ""
Write-Host "Windows will open automatically. Wait for them to load!" -ForegroundColor Green
Write-Host "Press any key to close this window (services will keep running)..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

