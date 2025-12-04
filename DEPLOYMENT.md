# Christmas Party Feedback System - Production Deployment

## Server Information
- **Public IP**: 112.198.194.104
- **Local IP**: 10.10.0.3
- **Container Platform**: Portainer
- **Web Server**: NPM (Nginx Proxy Manager)

## Deployment Guide

### Prerequisites on Server
- Docker and Docker Compose installed
- Portainer running
- NPM (Nginx Proxy Manager) configured
- Git installed

---

## Option 1: Deploy via Portainer Stacks (Recommended)

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit - Christmas Party Feedback System"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

### 2. On Production Server (112.198.194.104)

SSH into your server:
```bash
ssh user@112.198.194.104
```

Clone the repository:
```bash
cd /opt
git clone YOUR_GITHUB_REPO_URL christmas-feedback
cd christmas-feedback
```

### 3. Find Available Ports (IMPORTANT!)

Since many apps are already running, check for available ports:

```bash
# Run the port checker script
chmod +x check-ports.sh
./check-ports.sh
```

Or manually check:
```bash
# Check if port 3000 is available
netstat -tuln | grep :3000

# Check if port 5432 is available
netstat -tuln | grep :5432

# List all ports in use
netstat -tuln | grep LISTEN
```

**Common alternatives:**
- App ports: 3001, 3002, 3005, 8080, 8081, 8888
- DB ports: 5433, 5434, 5435

### 4. Configure Environment

Create production environment file:
```bash
nano .env.production
```

Add your configuration (adjust ports as needed!):
```env
# IMPORTANT: Use available ports from step 3!
APP_PORT=3001              # Change to available port (if 3000 is taken)
DB_PORT=5433               # Change to available port (if 5432 is taken)

# Database URL - UPDATE the port (5433) to match DB_PORT above!
DATABASE_URL="postgresql://postgres:YOUR_SECURE_PASSWORD@10.10.0.3:5433/christmas_feedback?schema=public"

NODE_ENV=production
POSTGRES_USER=postgres
POSTGRES_PASSWORD=YOUR_SECURE_PASSWORD
POSTGRES_DB=christmas_feedback
```

**Example if using different ports:**
```env
# If 3000 and 5432 are both taken, use alternatives:
APP_PORT=3005
DB_PORT=5434
DATABASE_URL="postgresql://postgres:SecurePass123@10.10.0.3:5434/christmas_feedback?schema=public"
```

### 5. Deploy via Portainer

#### Option A: Using Portainer Stacks
1. Open Portainer UI (usually http://112.198.194.104:9000)
2. Go to **Stacks** → **Add Stack**
3. Name: `christmas-feedback`
4. Upload `docker-compose.prod.yml` or paste its contents
5. In **Environment Variables**, add:
   - `DATABASE_URL` = your database URL
   - `POSTGRES_PASSWORD` = secure password
6. Click **Deploy the stack**

1. Open NPM UI (usually http://112.198.194.104:81)
2. Add **Proxy Host**:
   - **Domain Names**: `feedback.yourdomain.com` (or use IP)
   - **Scheme**: `http`
   - **Forward Hostname/IP**: `10.10.0.3`
   - **Forward Port**: `3001` (or whatever APP_PORT you set)
   - **Cache Assets**: ✅ Enabled
   - **Block Common Exploits**: ✅ Enabled
   - **Websockets Support**: ✅ Enabled
docker-compose -f docker-compose.prod.yml logs -f
```

### 5. Configure NPM (Nginx Proxy Manager)

1. Open NPM UI (usually http://112.198.194.104:81)
2. Add **Proxy Host**:
   - **Domain Names**: `feedback.yourdomain.com` (or use IP)
   - **Scheme**: `http`
   - **Forward Hostname/IP**: `10.10.0.3`
   - **Forward Port**: `3000`
   - **Cache Assets**: ✅ Enabled
   - **Block Common Exploits**: ✅ Enabled
   - **Websockets Support**: ✅ Enabled

3. SSL Tab (optional but recommended):
   - Request SSL Certificate (Let's Encrypt)
   - Force SSL: ✅ Enabled

4. Save

### 6. Verify Deployment

```bash
# Check containers are running
docker ps | grep christmas-feedback

# Check which port the app is using
docker port christmas-feedback-app

# Test database connection
docker exec christmas-feedback-db psql -U postgres -d christmas_feedback -c "\dt"

# Test application (replace 3001 with your APP_PORT)
curl http://10.10.0.3:3001

# Or from outside (replace 3001 with your APP_PORT)
curl http://112.198.194.104:3001
```

---

## Option 2: Manual Docker Build & Run

### 1. Build the Docker Image
```bash
cd /opt/christmas-feedback
docker build -t christmas-feedback:latest .
```

### 2. Run PostgreSQL
```bash
docker run -d \
  --name christmas-feedback-db \
  --restart unless-stopped \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=YOUR_SECURE_PASSWORD \
  -e POSTGRES_DB=christmas_feedback \
  -v postgres_data:/var/lib/postgresql/data \
  -p 5432:5432 \
  postgres:16-alpine
```

### 3. Run the Application
```bash
docker run -d \
  --name christmas-feedback-app \
  --restart unless-stopped \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e DATABASE_URL="postgresql://postgres:YOUR_SECURE_PASSWORD@10.10.0.3:5432/christmas_feedback?schema=public" \
  --link christmas-feedback-db:postgres \
  christmas-feedback:latest
```

---

## Updating the Application

### Via Git Pull
```bash
ssh user@112.198.194.104
cd /opt/christmas-feedback
git pull origin main
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build
```

### Via Portainer
1. Go to your stack in Portainer
2. Click **Editor**
3. Enable **Re-pull image and redeploy**
4. Click **Update the stack**

---

## Database Backup

### Manual Backup
```bash
docker exec christmas-feedback-db pg_dump -U postgres christmas_feedback > backup_$(date +%Y%m%d).sql
```

### Restore Backup
```bash
docker exec -i christmas-feedback-db psql -U postgres christmas_feedback < backup_YYYYMMDD.sql
```

### Automated Backups (Cron)
```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * docker exec christmas-feedback-db pg_dump -U postgres christmas_feedback > /backups/christmas_feedback_$(date +\%Y\%m\%d).sql
```

---

## Monitoring

### View Application Logs
```bash
docker logs -f christmas-feedback-app
```

### View Database Logs
```bash
docker logs -f christmas-feedback-db
```

### Check Application Status
```bash
docker ps | grep christmas-feedback
docker stats christmas-feedback-app
```

---

## Troubleshooting

### Container Won't Start
```bash
# Check logs
docker logs christmas-feedback-app

# Check environment variables
docker exec christmas-feedback-app env

# Verify database connection
docker exec christmas-feedback-app npx prisma migrate status
```

### Database Connection Issues
```bash
# Test from app container
docker exec christmas-feedback-app ping postgres

# Test PostgreSQL is running
docker exec christmas-feedback-db psql -U postgres -c "SELECT version();"
```

### NPM/Nginx Issues
```bash
# Check NPM logs
docker logs nginx-proxy-manager

# Test direct connection (bypass NPM)
curl http://10.10.0.3:3000
```

---

## Security Recommendations

1. **Change Default Passwords**: Update PostgreSQL password in .env.production
2. **Enable SSL**: Configure SSL certificate in NPM
3. **Firewall Rules**: Only expose necessary ports
4. **Regular Updates**: Keep Docker images updated
5. **Backup Strategy**: Implement automated backups
6. **Monitor Logs**: Set up log monitoring/alerts

---

## Access URLs

After deployment:
- **Internal**: http://10.10.0.3:3000
- **External**: http://112.198.194.104:3000
- **Via NPM**: http://your-domain.com (after NPM configuration)

---

## Quick Commands Reference

```bash
# Start stack
docker-compose -f docker-compose.prod.yml up -d

# Stop stack
docker-compose -f docker-compose.prod.yml down

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Restart app only
docker restart christmas-feedback-app

# Run migrations
docker exec christmas-feedback-app npx prisma migrate deploy

# Access Prisma Studio (temporarily)
docker exec -it christmas-feedback-app npx prisma studio
```

---

🎄 **Ready for Production!** 🎄
