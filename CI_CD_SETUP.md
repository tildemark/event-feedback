# CI/CD Setup Guide

## Overview

This project uses GitHub Actions for continuous integration and deployment:

1. **Build & Test** - Runs on every pull request and push to main
2. **Deploy to Production** - Automatically deploys to production server on push to main

---

## Setup Instructions

### 1. Configure GitHub Secrets

Go to your GitHub repository:
```
Settings → Secrets and variables → Actions → New repository secret
```

Add the following secrets:

#### Required Secrets:

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `PROD_SERVER_HOST` | `112.198.194.104` | Production server IP |
| `PROD_SERVER_USER` | `your-username` | SSH username (e.g., `root`, `ubuntu`, `admin`) |
| `PROD_SERVER_PASSWORD` | `your-ssh-password` | SSH password for authentication |
| `PROD_SERVER_PORT` | `22` | SSH port (usually 22) |

---

### 2. Password Authentication

This deployment uses password-based SSH authentication.

**Security Notes:**
- ⚠️ Store the password only in GitHub Secrets
- Never commit passwords to the repository
- Use a strong, unique password
- Consider rotating the password regularly

**Test SSH Connection:**
```bash
ssh user@112.198.194.104
# Enter password when prompted
```

---

### 3. Prepare Production Server

SSH into your production server and set up the deployment directory:

```bash
# SSH into server
ssh user@112.198.194.104

# Create deployment directory
sudo mkdir -p /opt/christmas-feedback
sudo chown $USER:$USER /opt/christmas-feedback

# Clone repository (first time only)
cd /opt
git clone https://github.com/tildemark/event-feedback.git christmas-feedback
cd christmas-feedback

# Configure environment
cp .env.production.example .env.production
nano .env.production
# Set your APP_PORT, DB_PORT, DATABASE_URL, passwords, etc.

# Make sure .env exists for docker-compose
cp .env.production .env

# Test deployment manually first
docker-compose -f docker-compose.prod.yml up -d
```

---

### 4. Test SSH Connection

Verify GitHub Actions can connect:

```bash
# From your local machine
ssh -i ~/.ssh/github_deploy user@112.198.194.104 "echo 'Connection successful!'"
```

If successful, you should see: `Connection successful!`

---

### 5. Enable GitHub Actions

The workflows are already configured in `.github/workflows/`:

- **`.github/workflows/build.yml`** - Build and test on every PR/push
- **`.github/workflows/deploy.yml`** - Deploy to production on push to main

They will automatically run when you push to GitHub.

---

## Workflow Details

### Build Workflow (build.yml)

**Triggers:** Pull requests and pushes to main

**Steps:**
1. Checkout code
2. Setup Node.js 18
3. Install dependencies
4. Generate Prisma Client
5. Run database migrations (test DB)
6. Build Next.js application
7. Verify build output

**Purpose:** Ensures code builds successfully before merging/deploying

---

### Deploy Workflow (deploy.yml)

**Triggers:** 
- Push to main branch
- Manual trigger (workflow_dispatch)

**Steps:**
1. Checkout code
2. SSH into production server (112.198.194.104)
3. Pull latest changes from GitHub
4. Check available ports
5. Rebuild and restart Docker containers
6. Run database migrations
7. Verify deployment
8. Test application endpoint

**Purpose:** Automatically deploys changes to production

---

## Deployment Process

### Automatic Deployment

1. Make changes to your code
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin main
   ```
3. GitHub Actions automatically:
   - Builds and tests the code
   - Deploys to production server
   - Runs database migrations
   - Restarts containers

### Manual Deployment

Trigger deployment manually from GitHub:

1. Go to: `Actions → Deploy to Production → Run workflow`
2. Click "Run workflow" button
3. Monitor progress in the Actions tab

---

## Monitoring Deployments

### View Deployment Status

1. Go to your GitHub repository
2. Click **Actions** tab
3. See all workflow runs with status (✅ success or ❌ failure)
4. Click on a run to see detailed logs

### Check Production Server

After deployment:

```bash
# SSH into server
ssh user@112.198.194.104

# Check running containers
docker ps | grep christmas-feedback

# View application logs
docker logs -f christmas-feedback-app

# View deployment status
cd /opt/christmas-feedback
git log -1  # See latest commit deployed
```

---

## Rollback Procedure

If deployment fails or you need to rollback:

```bash
# SSH into production server
ssh user@112.198.194.104
cd /opt/christmas-feedback

# Check git history
git log --oneline -10

# Rollback to previous commit
git reset --hard COMMIT_HASH

# Redeploy
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build
```

---

## Environment Variables

Make sure `.env.production` exists on the server with:

```env
APP_PORT=3001
DB_PORT=5433
DATABASE_URL="postgresql://postgres:PASSWORD@10.10.0.3:5433/christmas_feedback"
NODE_ENV=production
POSTGRES_PASSWORD=YOUR_SECURE_PASSWORD
```

This file is **NOT** in Git (ignored by `.gitignore`) for security.

---

## Security Best Practices

1. **SSH Key**: Use a dedicated SSH key for deployments (not your personal key)
2. **Secrets**: Never commit secrets to Git
3. **Environment Files**: `.env.production` is in `.gitignore`
4. **User Permissions**: Use a non-root user with limited permissions
5. **Firewall**: Restrict SSH access to specific IPs if possible

---

## Troubleshooting

### Deployment Fails - SSH Connection

```bash
# Check if SSH key is correct
ssh -i ~/.ssh/github_deploy user@112.198.194.104

# Verify key is added to authorized_keys
cat ~/.ssh/authorized_keys | grep github-actions
```

### Deployment Fails - Docker Issues

```bash
# Check Docker is running
docker ps

# Check disk space
df -h

# Check Docker logs
docker logs christmas-feedback-app
```

### Database Migration Fails

```bash
# Check database is running
docker ps | grep postgres

# Run migrations manually
docker exec christmas-feedback-app npx prisma migrate deploy

# Check migration status
docker exec christmas-feedback-app npx prisma migrate status
```

### Port Already in Use

```bash
# Find what's using the port
netstat -tuln | grep :3001

# Update .env.production with different port
# Restart containers
docker-compose -f docker-compose.prod.yml restart
```

---

## Advanced: Multi-Environment Setup

### Add Staging Environment

1. Create `.github/workflows/deploy-staging.yml`
2. Add staging secrets: `STAGING_SERVER_HOST`, etc.
3. Deploy to staging on push to `develop` branch
4. Test on staging before merging to `main`

### Add Deployment Notifications

Add to deploy workflow:

```yaml
- name: Notify on Success
  if: success()
  uses: appleboy/telegram-action@master
  with:
    to: ${{ secrets.TELEGRAM_CHAT_ID }}
    token: ${{ secrets.TELEGRAM_TOKEN }}
    message: "✅ Christmas Feedback deployed successfully!"
```

---

## Quick Reference

### GitHub Actions Commands

```bash
# View workflow status
gh workflow list

# View recent runs
gh run list

# View specific run
gh run view RUN_ID

# Re-run failed deployment
gh run rerun RUN_ID
```

### Production Server Commands

```bash
# Check deployment
cd /opt/christmas-feedback && git log -1

# View logs
docker logs -f christmas-feedback-app

# Restart app
docker restart christmas-feedback-app

# Full restart
docker-compose -f docker-compose.prod.yml restart
```

---

## 🎄 CI/CD is Ready!

After setup:
1. ✅ Every push to main auto-deploys
2. ✅ Pull requests are auto-tested
3. ✅ Database migrations run automatically
4. ✅ Zero-downtime deployments
5. ✅ Easy rollback if needed

**Just push to GitHub and relax!** 🚀
