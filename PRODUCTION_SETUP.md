# Production Server Setup Guide

## Initial Setup on Production Server (10.10.0.3)

### Prerequisites

1. SSH access to production server (10.10.0.3)
2. Docker and Docker Compose installed (✅ Already have Portainer at port 9091)
3. Git installed
4. Sudo privileges

**Note:** You have Portainer installed at http://10.10.0.3:9091 - You can use it to manage containers! See `PORTAINER_DEPLOYMENT.md` for Portainer-specific instructions.

---

## Step-by-Step Setup

### 1. SSH into Production Server

From your Windows machine:

```powershell
ssh user@10.10.0.3
```

### 2. Install Docker (if not installed)

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add your user to docker group
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Logout and login again for group changes to take effect
exit
```

SSH back in:
```bash
ssh user@10.10.0.3
```

Verify installation:
```bash
docker --version
docker-compose --version
```

### 3. Clone the Repository

```bash
# Create project directory
sudo mkdir -p /opt/christmas-feedback
sudo chown -R $USER:$USER /opt/christmas-feedback
cd /opt/christmas-feedback

# Clone from GitHub
git clone https://github.com/tildemark/event-feedback.git .
```

### 4. Check Available Ports

```bash
# Make script executable
chmod +x check-ports.sh

# Run port checker
./check-ports.sh
```

This will show you which ports are available. Note down available ports for APP_PORT and DB_PORT.

### 5. Configure Environment Variables

```bash
# Copy example file
cp .env.production.example .env.production

# Edit the file
nano .env.production
```

**Set these values:**

```env
# Database Configuration
DATABASE_URL="postgresql://feedbackuser:YOUR_SECURE_PASSWORD@db:5432/christmas_feedback"

# Port Configuration - USE AVAILABLE PORTS!
APP_PORT=3001  # Change if port 3001 is taken
DB_PORT=5433   # Change if port 5433 is taken

# Environment
NODE_ENV=production
```

**Important:**
- Change `YOUR_SECURE_PASSWORD` to a strong password
- Set `APP_PORT` to an available port (from step 4)
- Set `DB_PORT` to an available port (from step 4)

Save and exit (Ctrl+X, then Y, then Enter)

### 6. Build and Start the Application

```bash
# Build and start containers
docker-compose -f docker-compose.prod.yml up -d --build

# Wait for services to start
sleep 15

# Run database migrations
docker exec christmas-feedback-app npx prisma migrate deploy
```

### 7. Verify Deployment

```bash
# Check if containers are running
docker ps | grep christmas-feedback

# You should see two containers:
# - christmas-feedback-app
# - christmas-feedback-db

# Check logs
docker-compose -f docker-compose.prod.yml logs -f app

# Press Ctrl+C to exit logs
```

### 8. Test the Application

```bash
# Test from the server
curl http://localhost:3001  # Use your APP_PORT

# Should return HTML content
```

From your Windows machine, test via LAN:
```powershell
# Test from your dev machine
curl http://10.10.0.3:3001  # Use your APP_PORT
```

---

## Configure Nginx Proxy Manager

Now that the application is running, configure NPM to make it accessible via the public IP.

### 1. Access Nginx Proxy Manager

Open NPM in your browser (usually at http://112.198.194.104:81 or similar)

### 2. Add Proxy Host

1. Click **"Proxy Hosts"** → **"Add Proxy Host"**

2. **Details tab:**
   - Domain Names: `feedback.yourdomain.com` (or use IP: `112.198.194.104`)
   - Scheme: `http`
   - Forward Hostname/IP: `10.10.0.3`
   - Forward Port: `3001` (or your APP_PORT)
   - Enable: ✅ Block Common Exploits
   - Enable: ✅ Websockets Support

3. **SSL tab (optional):**
   - If using a domain, request SSL certificate
   - Enable: Force SSL, HTTP/2 Support, HSTS

4. Click **"Save"**

### 3. Test Public Access

Open browser and go to:
- http://112.198.194.104 (or your domain)

You should see the Christmas Feedback form! 🎄

---

## Automatic Setup Script

Alternatively, use the automatic setup script:

```bash
# SSH into server
ssh user@10.10.0.3

# Create directory
sudo mkdir -p /opt/christmas-feedback
sudo chown -R $USER:$USER /opt/christmas-feedback
cd /opt/christmas-feedback

# Clone repository
git clone https://github.com/tildemark/event-feedback.git .

# Run setup script
chmod +x setup-production.sh
./setup-production.sh
```

The script will:
1. ✅ Check Docker installation
2. ✅ Clone/update repository
3. ✅ Check available ports
4. ✅ Create .env.production with random password
5. ✅ Build and start containers
6. ✅ Run database migrations
7. ✅ Verify deployment

---

## Common Commands

### View Logs
```bash
cd /opt/christmas-feedback
docker-compose -f docker-compose.prod.yml logs -f
```

### Restart Application
```bash
cd /opt/christmas-feedback
docker-compose -f docker-compose.prod.yml restart
```

### Stop Application
```bash
cd /opt/christmas-feedback
docker-compose -f docker-compose.prod.yml down
```

### Update from GitHub
```bash
cd /opt/christmas-feedback
git pull origin main
docker-compose -f docker-compose.prod.yml up -d --build
docker exec christmas-feedback-app npx prisma migrate deploy
```

### Access Database
```bash
docker exec -it christmas-feedback-db psql -U feedbackuser -d christmas_feedback
```

### Check Container Status
```bash
docker ps --filter "name=christmas-feedback"
```

### View Container Resource Usage
```bash
docker stats christmas-feedback-app christmas-feedback-db
```

---

## Troubleshooting

### Containers Won't Start

```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs

# Common issues:
# 1. Port already in use - change APP_PORT or DB_PORT in .env.production
# 2. Permission denied - ensure /opt/christmas-feedback is owned by your user
# 3. Docker daemon not running - sudo systemctl start docker
```

### Port Already in Use

```bash
# Find which process is using the port
sudo netstat -tulpn | grep :3001  # Replace 3001 with your port

# Kill the process or choose a different port in .env.production
```

### Database Connection Failed

```bash
# Check database container
docker logs christmas-feedback-db

# Verify DATABASE_URL in .env.production
# Make sure password matches in the connection string
```

### Can't Access from Browser

```bash
# Test locally on server
curl http://localhost:3001

# Test from LAN
curl http://10.10.0.3:3001

# Check firewall
sudo ufw status

# If needed, allow the port
sudo ufw allow 3001/tcp
```

### Need to Reset Everything

```bash
cd /opt/christmas-feedback

# Stop and remove containers, volumes
docker-compose -f docker-compose.prod.yml down -v

# Remove all data
docker system prune -f

# Start fresh
docker-compose -f docker-compose.prod.yml up -d --build
docker exec christmas-feedback-app npx prisma migrate deploy
```

---

## Security Checklist

- ✅ Strong database password in .env.production
- ✅ .env.production is not committed to git (in .gitignore)
- ✅ Only expose necessary ports in Nginx Proxy Manager
- ✅ Enable SSL certificate if using a domain
- ✅ Keep Docker and system packages updated
- ✅ Regular backups of database
- ✅ Monitor application logs for errors

---

## Backup Database

```bash
# Create backup
docker exec christmas-feedback-db pg_dump -U feedbackuser christmas_feedback > backup_$(date +%Y%m%d).sql

# Restore backup
cat backup_20251204.sql | docker exec -i christmas-feedback-db psql -U feedbackuser -d christmas_feedback
```

---

## Next Steps

1. ✅ Complete initial setup (above)
2. Configure Nginx Proxy Manager
3. Test the application thoroughly
4. Share the URL with your team
5. Monitor feedback submissions
6. Access admin report at: http://your-domain/report

---

## Support

If you encounter issues:
1. Check logs: `docker-compose -f docker-compose.prod.yml logs -f`
2. Verify all containers are running: `docker ps`
3. Check .env.production configuration
4. Review troubleshooting section above
