# Port Finder Script for Windows/PowerShell
# Checks which ports are available

Write-Host "`n🔍 Checking available ports..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

function Test-Port {
    param($Port)
    $connection = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    if ($connection) {
        Write-Host "❌ Port $Port is IN USE" -ForegroundColor Red
        return $false
    } else {
        Write-Host "✅ Port $Port is AVAILABLE" -ForegroundColor Green
        return $true
    }
}

Write-Host "📱 Application Ports:" -ForegroundColor Yellow
$appPorts = @(3000, 3001, 3002, 3003, 3004, 3005, 8080, 8081, 8082, 8888)
$availableAppPort = $null
foreach ($port in $appPorts) {
    if (Test-Port -Port $port) {
        if (-not $availableAppPort) { $availableAppPort = $port }
    }
}

Write-Host "`n🗄️  Database Ports:" -ForegroundColor Yellow
$dbPorts = @(5432, 5433, 5434, 5435, 5436)
$availableDbPort = $null
foreach ($port in $dbPorts) {
    if (Test-Port -Port $port) {
        if (-not $availableDbPort) { $availableDbPort = $port }
    }
}

Write-Host "`n💡 Recommendation:" -ForegroundColor Cyan
if ($availableAppPort) {
    Write-Host "   - Use APP_PORT=$availableAppPort for the application" -ForegroundColor Green
} else {
    Write-Host "   - No common app ports available! Use a custom port like 9000" -ForegroundColor Yellow
}

if ($availableDbPort) {
    Write-Host "   - Use DB_PORT=$availableDbPort for PostgreSQL" -ForegroundColor Green
} else {
    Write-Host "   - No common DB ports available! Use a custom port like 5440" -ForegroundColor Yellow
}

Write-Host "`nExample .env.production configuration:" -ForegroundColor Cyan
if ($availableAppPort -and $availableDbPort) {
    Write-Host "   APP_PORT=$availableAppPort" -ForegroundColor White
    Write-Host "   DB_PORT=$availableDbPort" -ForegroundColor White
    Write-Host "   DATABASE_URL=`"postgresql://postgres:PASSWORD@10.10.0.3:$availableDbPort/christmas_feedback`"" -ForegroundColor White
}
Write-Host ""
