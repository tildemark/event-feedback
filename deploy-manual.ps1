# Manual Deployment Script
# Run this from your dev machine (E:\code\feedback) to deploy to production

param(
    [string]$ServerIP = "10.10.0.3",
    [string]$User = "root",
    [switch]$Help
)

if ($Help) {
    Write-Host @"
Christmas Feedback System - Manual Deployment Script
====================================================

Usage:
  .\deploy-manual.ps1 [-ServerIP <ip>] [-User <username>]

Examples:
  .\deploy-manual.ps1
  .\deploy-manual.ps1 -ServerIP 10.10.0.3 -User ubuntu
  .\deploy-manual.ps1 -Help

This script will:
1. Push code to GitHub
2. SSH into production server
3. Pull latest code
4. Rebuild Docker containers
5. Run database migrations

Prerequisites:
- SSH access to $ServerIP
- Git configured with GitHub
- Production server has Docker installed
"@
    exit 0
}

Write-Host "`n🎄 Christmas Feedback Deployment Script" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green

# Step 1: Push to GitHub
Write-Host "📤 Step 1: Pushing to GitHub..." -ForegroundColor Cyan
try {
    git add .
    git commit -m "Deploy $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    git push origin main
    Write-Host "✅ Code pushed to GitHub`n" -ForegroundColor Green
} catch {
    Write-Host "⚠️  No changes to commit or already pushed`n" -ForegroundColor Yellow
}

# Step 2: SSH and Deploy
Write-Host "🚀 Step 2: Deploying to production server ($ServerIP)..." -ForegroundColor Cyan
Write-Host "You'll need to enter your SSH password...`n" -ForegroundColor Yellow

# Create deployment commands
$deployCommands = @"
cd /opt/christmas-feedback

echo '🔄 Pulling latest changes...'
git pull origin main

echo '🔍 Checking for available ports...'
if [ -f check-ports.sh ]; then
  chmod +x check-ports.sh
  ./check-ports.sh
fi

echo '🐳 Rebuilding and restarting containers...'
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build

echo '⏳ Waiting for services to start...'
sleep 10

echo '📊 Running database migrations...'
docker exec christmas-feedback-app npx prisma migrate deploy

echo '✅ Checking deployment status...'
docker ps | grep christmas-feedback

echo '🎄 Deployment complete!'
echo ''
echo 'Application should be accessible via Nginx Proxy Manager'
"@

# Save commands to temp file
$tempFile = [System.IO.Path]::GetTempFileName()
$deployCommands | Out-File -FilePath $tempFile -Encoding ASCII

# SSH with PowerShell (will prompt for password)
Write-Host "Connecting to ${User}@${ServerIP}...`n" -ForegroundColor Cyan

try {
    # Try using ssh command (works if OpenSSH is installed on Windows)
    ssh ${User}@${ServerIP} "bash -s" < $tempFile
    
    Write-Host "`n✅ Deployment completed successfully!" -ForegroundColor Green
    Write-Host "🌐 Access your application at: http://112.198.194.104`n" -ForegroundColor Green
    
} catch {
    Write-Host "`n❌ Deployment failed!" -ForegroundColor Red
    Write-Host "Error: $_`n" -ForegroundColor Red
    
    Write-Host "Manual deployment steps:" -ForegroundColor Yellow
    Write-Host "1. SSH into server: ssh ${User}@${ServerIP}" -ForegroundColor White
    Write-Host "2. Run these commands:" -ForegroundColor White
    Write-Host $deployCommands -ForegroundColor Gray
} finally {
    # Clean up temp file
    Remove-Item $tempFile -ErrorAction SilentlyContinue
}

Write-Host "`n📋 Deployment Summary:" -ForegroundColor Cyan
Write-Host "  Server: $ServerIP" -ForegroundColor White
Write-Host "  User: $User" -ForegroundColor White
Write-Host "  Time: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor White
Write-Host ""
