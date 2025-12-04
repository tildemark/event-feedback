# Git Commands for GitHub Upload

## 1. Initialize Git Repository (if not done)
git init

## 2. Stage All Files
git add .

## 3. Create Initial Commit
git commit -m "Initial commit: Christmas Party Feedback System"

## 4. Rename Branch to Main
git branch -M main

## 5. Add GitHub Remote
# Replace YOUR_GITHUB_USERNAME and YOUR_REPO_NAME with actual values
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPO_NAME.git

# Example:
# git remote add origin https://github.com/yourcompany/christmas-feedback.git

## 6. Push to GitHub
git push -u origin main

---

## Quick One-Liner (after setting up GitHub repo)

```bash
git init && git add . && git commit -m "Initial commit: Christmas Party Feedback System" && git branch -M main && git remote add origin https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPO_NAME.git && git push -u origin main
```

---

## Create GitHub Repository First

1. Go to https://github.com/new
2. Repository name: `christmas-party-feedback`
3. Description: `Christmas Party Feedback System - Event feedback collection`
4. Choose Public or Private
5. DO NOT initialize with README (we already have files)
6. Click "Create repository"
7. Copy the repository URL
8. Use it in the commands above

---

## Future Updates

After making changes:

```bash
git add .
git commit -m "Describe your changes"
git push
```

---

## Clone on Production Server

```bash
# SSH into production server
ssh user@112.198.194.104

# Navigate to deployment directory
cd /opt

# Clone repository
git clone https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPO_NAME.git christmas-feedback

# Enter directory
cd christmas-feedback
```

---

## Files That Will Be Uploaded to GitHub

✅ Source code (app/, components/, lib/)
✅ Configuration files (package.json, tsconfig.json, etc.)
✅ Database schema (prisma/schema.prisma)
✅ Database migrations (prisma/migrations/)
✅ Docker files (Dockerfile, docker-compose.prod.yml)
✅ Documentation (README, DEPLOYMENT.md, etc.)
✅ Example environment file (.env.example, .env.production.example)

❌ Actual environment files (.env, .env.production)
❌ Node modules (node_modules/)
❌ Build output (.next/)
❌ Local development files

This is controlled by .gitignore
