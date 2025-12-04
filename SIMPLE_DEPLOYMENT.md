# Simple Deployment Workflow (No CI/CD)

## Overview

This approach uses direct SSH to production server and manual git commands. Perfect for when you have LAN access and want full control.

---

## One-Time Setup on Production Server

SSH into your production server:

```bash
ssh user@10.10.0.3
```

Then run these commands:

```bash
# 1. Create project directory
sudo mkdir -p /opt/christmas-feedback
cd /opt/christmas-feedback

# 2. Set ownership (replace 'user' with your username)
sudo chown -R user:user /opt/christmas-feedback

# 3. Clone the repository
git clone https://github.com/tildemark/event-feedback.git .

# 4. Create production environment file
cp .env.example .env.production

# 5. Edit environment variables
nano .env.production
```

**Configure `.env.production`:**
```env
DATABASE_URL="postgresql://feedbackuser:your_password@db:5432/christmas_feedback"
APP_PORT=3001  # Available: 3001-3005
DB_PORT=5432   # Available: 5432-5435
NODE_ENV=production
```

**Save and continue:**
```bash
# 6. Check for available ports
chmod +x check-ports.sh
./check-ports.sh

# Update .env.production with available ports if needed

# 7. Start the application
docker-compose -f docker-compose.prod.yml up -d --build

# 8. Run database migrations
docker exec christmas-feedback-app npx prisma migrate deploy

# 9. Verify deployment
docker ps | grep christmas-feedback
```

---

## Daily Deployment Workflow

### From Your Development Machine:

```powershell
# 1. Make your changes locally
# 2. Test locally (optional)
# 3. Commit and push to GitHub

git add .
git commit -m "Your changes description"
git push origin main
```

### On Production Server (via SSH):

```bash
# SSH into production
ssh user@10.10.0.3

# Navigate to project
cd /opt/christmas-feedback

# Pull latest changes
git pull origin main

# Rebuild and restart containers
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build

# Run any new migrations
docker exec christmas-feedback-app npx prisma migrate deploy

# Check status
docker ps | grep christmas-feedback

# View logs (optional)
docker-compose -f docker-compose.prod.yml logs -f
```

**Done!** Your changes are now live.

---

## Quick Commands Reference

### Check Application Status

**Via Command Line:**
```bash
ssh user@10.10.0.3 "cd /opt/christmas-feedback && docker ps"
```

**Via Portainer:**
- Open http://10.10.0.3:9091
- Go to Containers
- Look for `christmas-feedback-app` and `christmas-feedback-db`

### View Live Logs
```bash
ssh user@10.10.0.3 "cd /opt/christmas-feedback && docker-compose -f docker-compose.prod.yml logs -f app"
```

### Restart Application
```bash
ssh user@10.10.0.3 "cd /opt/christmas-feedback && docker-compose -f docker-compose.prod.yml restart app"
```

### Check Database
```bash
ssh user@10.10.0.3 "cd /opt/christmas-feedback && docker exec christmas-feedback-app npx prisma studio"
```

### Stop Application
```bash
ssh user@10.10.0.3 "cd /opt/christmas-feedback && docker-compose -f docker-compose.prod.yml down"
```

### Clean Rebuild (if issues occur)
```bash
ssh user@10.10.0.3 << 'EOF'
cd /opt/christmas-feedback
docker-compose -f docker-compose.prod.yml down -v
docker system prune -f
git pull origin main
docker-compose -f docker-compose.prod.yml up -d --build
docker exec christmas-feedback-app npx prisma migrate deploy
EOF
```

---

## Typical Deployment Session

**Scenario:** You fixed a bug and want to deploy

```powershell
# On your Windows machine (E:\code\feedback)
git add .
git commit -m "Fix: Rating submission validation"
git push origin main

# Connect to production
ssh user@10.10.0.3

# On production server
cd /opt/christmas-feedback
git pull
docker-compose -f docker-compose.prod.yml up -d --build
docker exec christmas-feedback-app npx prisma migrate deploy
exit
```

**Time: ~2-3 minutes**

---

## Troubleshooting

### "Git pull failed"
```bash
# Check git status
git status

# If there are local changes, stash them
git stash

# Pull again
git pull origin main

# If you need those changes back
git stash pop
```

### "Docker container won't start"
```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs

# Check if port is in use
netstat -tulpn | grep 3001

# Change port in .env.production and restart
nano .env.production
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d
```

### "Database migration failed"
```bash
# Connect to database container
docker exec -it christmas-feedback-db psql -U feedbackuser -d christmas_feedback

# Check migrations table
SELECT * FROM _prisma_migrations;

# Exit
\q

# Force migration
docker exec christmas-feedback-app npx prisma migrate deploy --force
```

### "Can't access application"
```bash
# Check if containers are running
docker ps

# Check Nginx Proxy Manager configuration
# - Ensure proxy host points to 10.10.0.3:3001 (or your APP_PORT)
# - Check SSL settings
# - Verify domain/subdomain configuration

# Test direct access
curl http://10.10.0.3:3001
```

---

## Optional: Create SSH Alias

Make SSH easier by adding to your SSH config:

**On Windows (PowerShell):**
```powershell
# Create/edit SSH config
notepad "$env:USERPROFILE\.ssh\config"
```

**Add this:**
```
Host christmas-prod
    HostName 10.10.0.3
    User your-username
    Port 22
```

**Now you can just type:**
```powershell
ssh christmas-prod
```

---

## Optional: One-Command Deploy Script

Save this as `deploy-ssh.ps1` on your machine:

```powershell
# Push to GitHub
git add .
git commit -m "Deploy $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
git push origin main

# Deploy on production
ssh user@10.10.0.3 @"
cd /opt/christmas-feedback
git pull origin main
docker-compose -f docker-compose.prod.yml up -d --build
docker exec christmas-feedback-app npx prisma migrate deploy
docker ps | grep christmas-feedback
"@

Write-Host "✅ Deployed successfully!" -ForegroundColor Green
```

**Usage:**
```powershell
.\deploy-ssh.ps1
```

---

## Summary

**Advantages of this approach:**
- ✅ Simple and straightforward
- ✅ Full control over deployment
- ✅ No complex CI/CD setup needed
- ✅ Works perfectly with your network restrictions
- ✅ Easy to troubleshoot
- ✅ Can see logs in real-time

**Workflow:**
1. Code on your machine → Push to GitHub
2. SSH to production → Pull from GitHub
3. Rebuild containers → Done

**Time per deployment:** 2-3 minutes
