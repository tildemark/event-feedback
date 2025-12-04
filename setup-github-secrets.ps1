# GitHub Secrets Setup Helper Script (PowerShell)

Write-Host "`n🔐 GitHub Secrets Configuration Helper" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

$PROD_HOST = "112.198.194.104"
$PROD_PORT = "22"

Write-Host "Production Server: $PROD_HOST" -ForegroundColor Green
Write-Host ""

# Check if gh CLI is installed
$ghInstalled = Get-Command gh -ErrorAction SilentlyContinue

if (-not $ghInstalled) {
    Write-Host "⚠️  GitHub CLI (gh) is not installed." -ForegroundColor Yellow
    Write-Host "Install it from: https://cli.github.com/" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Or configure secrets manually:" -ForegroundColor Yellow
    Write-Host "1. Go to: https://github.com/tildemark/event-feedback/settings/secrets/actions"
    Write-Host "2. Add the secrets listed below"
    Write-Host ""
}

# Using password authentication - no SSH key needed
Write-Host "ℹ️  Using password authentication (no SSH key required)" -ForegroundColor Cyan
Write-Host ""

Write-Host "📋 Copy these values to GitHub Secrets:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Secret: PROD_SERVER_HOST" -ForegroundColor Yellow
Write-Host "Value: $PROD_HOST" -ForegroundColor White
Write-Host ""

Write-Host "Secret: PROD_SERVER_PORT" -ForegroundColor Yellow
Write-Host "Value: $PROD_PORT" -ForegroundColor White
Write-Host ""

Write-Host "Secret: PROD_SERVER_USER" -ForegroundColor Yellow
$SSH_USER = Read-Host "Enter SSH username (e.g., root, ubuntu)"
Write-Host "Value: $SSH_USER" -ForegroundColor White
Write-Host ""

Write-Host "Secret: PROD_SERVER_PASSWORD" -ForegroundColor Yellow
$SSH_PASSWORD = Read-Host "Enter SSH password" -AsSecureString
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($SSH_PASSWORD)
$SSH_PASSWORD_PLAIN = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
Write-Host "Value: ********** (password hidden)" -ForegroundColor White
Write-Host ""

# Use gh CLI if available
if ($ghInstalled) {
    $useGh = Read-Host "🚀 Set secrets using GitHub CLI? (y/n)"
    
    if ($useGh -eq "y") {
        Write-Host "Setting secrets..." -ForegroundColor Cyan
        
        gh secret set PROD_SERVER_HOST -b $PROD_HOST
        gh secret set PROD_SERVER_PORT -b $PROD_PORT
        gh secret set PROD_SERVER_USER -b $SSH_USER
        
        Write-Host "Setting PROD_SERVER_PASSWORD..." -ForegroundColor Cyan
        gh secret set PROD_SERVER_PASSWORD -b $SSH_PASSWORD_PLAIN
        
        Write-Host "✅ Secrets configured!" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "🎄 Next Steps:" -ForegroundColor Green
Write-Host "1. Add the public key to your server" -ForegroundColor White
Write-Host "2. If not using gh CLI, manually add secrets to GitHub" -ForegroundColor White
Write-Host "3. Push to GitHub to trigger deployment" -ForegroundColor White
Write-Host ""

Write-Host "GitHub Secrets URL:" -ForegroundColor Cyan
Write-Host "https://github.com/tildemark/event-feedback/settings/secrets/actions" -ForegroundColor White
Write-Host ""
