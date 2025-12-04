# Quick Start Test Script
# Run this to get started with testing

Write-Host "🎄 Christmas Party Feedback - Quick Start" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  No .env file found. Creating from template..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
    Write-Host "✅ Created .env file" -ForegroundColor Green
    Write-Host "`n📝 IMPORTANT: You need to configure your DATABASE_URL in .env" -ForegroundColor Cyan
    Write-Host "`nOptions:" -ForegroundColor White
    Write-Host "  1. Use a free cloud database (Easiest):" -ForegroundColor White
    Write-Host "     - Neon: https://neon.tech (Free tier, instant setup)" -ForegroundColor Gray
    Write-Host "     - Supabase: https://supabase.com" -ForegroundColor Gray
    Write-Host "`n  2. Use Docker (Quick):" -ForegroundColor White
    Write-Host "     docker run --name christmas-db -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres" -ForegroundColor Gray
    Write-Host "`n  3. Install PostgreSQL locally:" -ForegroundColor White
    Write-Host "     https://www.postgresql.org/download/windows/" -ForegroundColor Gray
    Write-Host "`nAfter setting up database, edit .env and run this script again.`n" -ForegroundColor Cyan
    
    # Open .env file for editing
    notepad .env
    exit
}

Write-Host "✅ Found .env file" -ForegroundColor Green

# Read DATABASE_URL from .env
$envContent = Get-Content ".env" -Raw
if ($envContent -match 'DATABASE_URL="([^"]+)"') {
    $dbUrl = $matches[1]
    if ($dbUrl -like "*username:password@localhost*" -or $dbUrl -eq "") {
        Write-Host "⚠️  DATABASE_URL needs to be configured in .env" -ForegroundColor Yellow
        Write-Host "Current value looks like the example. Please update it.`n" -ForegroundColor Yellow
        notepad .env
        exit
    }
    Write-Host "✅ DATABASE_URL is configured" -ForegroundColor Green
} else {
    Write-Host "❌ DATABASE_URL not found in .env" -ForegroundColor Red
    exit
}

# Check if dependencies are installed
if (-not (Test-Path "node_modules")) {
    Write-Host "`n📦 Installing dependencies..." -ForegroundColor Cyan
    npm install
}

# Generate Prisma Client
Write-Host "`n🔧 Generating Prisma Client..." -ForegroundColor Cyan
npx prisma generate

# Run migrations
Write-Host "`n🗄️  Running database migrations..." -ForegroundColor Cyan
$migrationResult = npx prisma migrate dev --name init 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Database migrations completed" -ForegroundColor Green
} else {
    Write-Host "❌ Database migration failed. Check your DATABASE_URL" -ForegroundColor Red
    Write-Host "Error: $migrationResult" -ForegroundColor Red
    exit
}

# Start dev server
Write-Host "`n🚀 Starting development server..." -ForegroundColor Cyan
Write-Host "Once started, open: http://localhost:3000" -ForegroundColor Green
Write-Host "`nPress Ctrl+C to stop the server`n" -ForegroundColor Yellow

npm run dev
