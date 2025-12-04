# Simple SSH Deploy Script
# One command to deploy everything!

param(
    [string]$Server = "10.10.0.3",
    [string]$User = "root",
    [string]$CommitMessage = "Deploy $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')",
    [switch]$SkipPush,
    [switch]$Help
)

if ($Help) {
    Write-Host @"
🎄 Christmas Feedback - Simple Deploy
====================================

Usage:
  .\deploy-ssh.ps1 [-Server <ip>] [-User <user>] [-CommitMessage <msg>] [-SkipPush]

Examples:
  .\deploy-ssh.ps1
  .\deploy-ssh.ps1 -CommitMessage "Fix star rating bug"
  .\deploy-ssh.ps1 -SkipPush  # Only deploy, don't push to GitHub
  .\deploy-ssh.ps1 -Server 10.10.0.3 -User ubuntu

What it does:
1. Commits and pushes your changes to GitHub (unless -SkipPush)
2. SSHs into production server
3. Pulls latest code
4. Rebuilds Docker containers
5. Runs database migrations

Prerequisites:
- SSH access to $Server
- Git configured
- Production server has Docker installed
"@
    exit 0
}

Write-Host "`n🎄 Christmas Feedback Deployment" -ForegroundColor Green
Write-Host "================================`n" -ForegroundColor Green

# Step 1: Push to GitHub (unless skipped)
if (-not $SkipPush) {
    Write-Host "📤 Pushing to GitHub..." -ForegroundColor Cyan
    
    try {
        $status = git status --porcelain
        
        if ($status) {
            git add .
            git commit -m $CommitMessage
            git push origin main
            Write-Host "✅ Pushed to GitHub`n" -ForegroundColor Green
        } else {
            Write-Host "ℹ️  No changes to commit`n" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "⚠️  Git push failed: $_" -ForegroundColor Yellow
        Write-Host "Continuing with deployment...`n" -ForegroundColor Yellow
    }
} else {
    Write-Host "⏭️  Skipping GitHub push`n" -ForegroundColor Yellow
}

# Step 2: Deploy to production
Write-Host "🚀 Deploying to ${User}@${Server}..." -ForegroundColor Cyan
Write-Host ""

$deployScript = @'
#!/bin/bash
set -e

echo "📂 Navigating to project directory..."
cd /opt/christmas-feedback

echo "🔄 Pulling latest changes from GitHub..."
git pull origin main

echo "🐳 Stopping current containers..."
docker-compose -f docker-compose.prod.yml down

echo "🔨 Building and starting containers..."
docker-compose -f docker-compose.prod.yml up -d --build

echo "⏳ Waiting for services to initialize..."
sleep 10

echo "📊 Running database migrations..."
docker exec christmas-feedback-app npx prisma migrate deploy 2>/dev/null || echo "No new migrations"

echo ""
echo "✅ Deployment Status:"
docker ps --filter "name=christmas-feedback" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "🎄 Deployment complete!"
echo "🌐 Application should be accessible via Nginx Proxy Manager"
'@

# Save script to temp file
$tempScript = [System.IO.Path]::GetTempFileName()
$deployScript | Out-File -FilePath $tempScript -Encoding ASCII -NoNewline

try {
    # Execute deployment via SSH
    ssh ${User}@${Server} 'bash -s' < $tempScript
    
    Write-Host "`n✅ Deployment successful!" -ForegroundColor Green
    Write-Host "🌐 Check your application at: http://112.198.194.104`n" -ForegroundColor Cyan
    
} catch {
    Write-Host "`n❌ Deployment failed!" -ForegroundColor Red
    Write-Host "Error: $_`n" -ForegroundColor Red
    
    Write-Host "💡 Try deploying manually:" -ForegroundColor Yellow
    Write-Host "   ssh ${User}@${Server}" -ForegroundColor White
    Write-Host "   cd /opt/christmas-feedback" -ForegroundColor White
    Write-Host "   git pull origin main" -ForegroundColor White
    Write-Host "   docker-compose -f docker-compose.prod.yml up -d --build`n" -ForegroundColor White
    
    exit 1
    
} finally {
    # Cleanup temp file
    Remove-Item $tempScript -ErrorAction SilentlyContinue
}

Write-Host "📋 Summary:" -ForegroundColor Cyan
Write-Host "   Server: $Server" -ForegroundColor White
Write-Host "   User: $User" -ForegroundColor White
Write-Host "   Time: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor White
Write-Host ""
