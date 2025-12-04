# Deploying with Portainer

## Overview

Your production server already has Portainer installed at port 9091. You can use Portainer's GUI to manage the Christmas Feedback application containers.

**Portainer Access:** http://10.10.0.3:9091 (or http://112.198.194.104:9091)

---

## Deployment Options

You have two options:

### Option 1: Command Line (Recommended for First Deploy)
Use the automated setup script - easier and faster

### Option 2: Portainer GUI
Use Portainer's interface - good for ongoing management

---

## Option 1: Command Line Deployment

This is the recommended approach for initial setup:

```bash
# SSH into server
ssh user@10.10.0.3

# Clone repository
sudo mkdir -p /opt/christmas-feedback
sudo chown -R $USER:$USER /opt/christmas-feedback
cd /opt/christmas-feedback
git clone https://github.com/tildemark/event-feedback.git .

# Run automated setup
chmod +x setup-production.sh
./setup-production.sh
```

The script will create and start the containers, which you can then manage via Portainer.

---

## Option 2: Deploy via Portainer GUI

### Step 1: Access Portainer

1. Open browser: http://10.10.0.3:9091
2. Login with your Portainer credentials

### Step 2: Prepare Files on Server

SSH into the server and prepare the repository:

```bash
ssh user@10.10.0.3

# Clone repository
sudo mkdir -p /opt/christmas-feedback
sudo chown -R $USER:$USER /opt/christmas-feedback
cd /opt/christmas-feedback
git clone https://github.com/tildemark/event-feedback.git .

# Check available ports
chmod +x check-ports.sh
./check-ports.sh

# Create environment file
cp .env.production.example .env.production
nano .env.production
```

**Edit `.env.production`:**
```env
DATABASE_URL="postgresql://feedbackuser:YOUR_SECURE_PASSWORD@db:5432/christmas_feedback"
APP_PORT=3001
DB_PORT=5433
NODE_ENV=production
```

Save and exit.

### Step 3: Deploy Stack in Portainer

1. In Portainer, go to **Stacks** → **Add stack**

2. **Name:** `christmas-feedback`

3. **Build method:** Select "Repository"
   - Repository URL: `https://github.com/tildemark/event-feedback`
   - Repository reference: `refs/heads/main`
   - Compose path: `docker-compose.prod.yml`

4. **OR Build method:** Select "Upload" or "Web editor"
   - Upload the `docker-compose.prod.yml` file
   - Or paste its contents

5. **Environment variables:**
   Click "Add an environment variable" and add:
   - Name: `APP_PORT`, Value: `3001`
   - Name: `DB_PORT`, Value: `5433`

6. **Advanced settings:**
   - Enable "Auto update"
   - Set update interval (optional)

7. Click **Deploy the stack**

### Step 4: Run Database Migration

After the stack is deployed:

1. Go to **Containers**
2. Find `christmas-feedback-app`
3. Click **Console** → **Connect**
4. Run:
   ```bash
   npx prisma migrate deploy
   ```

---

## Managing Containers with Portainer

### View Container Status

1. Go to **Containers**
2. Look for:
   - `christmas-feedback-app`
   - `christmas-feedback-db`

### View Logs

1. Click on container name
2. Go to **Logs** tab
3. Enable "Auto-refresh" to see live logs

### Restart Container

1. Select container
2. Click **Restart**

### Update Application

When you push changes to GitHub:

1. SSH into server:
   ```bash
   ssh user@10.10.0.3
   cd /opt/christmas-feedback
   git pull origin main
   ```

2. In Portainer:
   - Go to **Stacks** → `christmas-feedback`
   - Click **Update the stack**
   - Enable "Re-pull image and redeploy"
   - Click **Update**

3. Run migration (if needed):
   - Go to container console
   - Run: `npx prisma migrate deploy`

### Monitor Resources

1. Go to **Containers**
2. Click on container
3. View **Stats** tab for:
   - CPU usage
   - Memory usage
   - Network I/O

---

## Quick Deploy Script (Uses Portainer CLI)

If you have Portainer CLI configured:

```bash
# Update and redeploy via Portainer CLI
cd /opt/christmas-feedback
git pull origin main

# Redeploy stack
docker-compose -f docker-compose.prod.yml up -d --build

# Run migrations
docker exec christmas-feedback-app npx prisma migrate deploy
```

---

## Portainer Stacks Management

### View Stack Details

**Stacks → christmas-feedback**

You can see:
- Running containers
- Networks
- Volumes
- Environment variables

### Stop/Start Stack

- **Stop:** Stops all containers in the stack
- **Start:** Starts all containers
- **Remove:** Deletes the stack and all containers

### Edit Stack

1. Go to **Stacks** → `christmas-feedback`
2. Click **Editor**
3. Modify `docker-compose.prod.yml` content
4. Click **Update the stack**

---

## Backup & Restore with Portainer

### Backup Database

1. Go to **Containers** → `christmas-feedback-db`
2. Click **Console** → **Connect**
3. Run:
   ```bash
   pg_dump -U feedbackuser christmas_feedback > /backup/$(date +%Y%m%d).sql
   ```

Or use Portainer's volume backup feature:
1. Go to **Volumes**
2. Find `christmas-feedback_postgres_data`
3. Click **Backup** (if available in your Portainer version)

### Restore Database

1. Upload backup file to server
2. In container console:
   ```bash
   psql -U feedbackuser -d christmas_feedback < /path/to/backup.sql
   ```

---

## Environment Variables in Portainer

To change environment variables:

1. **Stacks** → `christmas-feedback` → **Editor**
2. Modify environment section or .env references
3. **Update the stack** → **Re-pull and redeploy**

Or:

1. Stop the stack
2. Go to **Containers** → Select container → **Duplicate/Edit**
3. Update environment variables
4. Recreate container

---

## Portainer + Nginx Proxy Manager Integration

Since you're using both:

1. **Portainer** (port 9091) - Container management
2. **NPM** - Reverse proxy for public access

### Setup NPM Proxy for the App

1. Access NPM web interface
2. Add Proxy Host:
   - Domain: Your domain or use IP
   - Scheme: `http`
   - Forward Hostname: `10.10.0.3`
   - Forward Port: `3001` (your APP_PORT)
   - Block Common Exploits: ✅
   - Websockets Support: ✅

3. Optional SSL:
   - Request Let's Encrypt certificate
   - Enable Force SSL, HTTP/2, HSTS

---

## Troubleshooting with Portainer

### Container Won't Start

1. Check **Logs** tab for error messages
2. Common issues:
   - Port already in use → Change APP_PORT in .env.production
   - Volume permission issues → Check ownership
   - Missing environment variables → Verify .env.production

### View Real-time Logs

1. Go to container
2. **Logs** tab
3. Enable **Auto-refresh logs**
4. Set refresh rate

### Inspect Container

1. Click container name
2. View:
   - **Inspect** - Full container configuration
   - **Stats** - Resource usage
   - **Console** - Execute commands

### Network Issues

1. **Networks** tab
2. Find `christmas-feedback_default`
3. Check connected containers
4. Verify IP addresses

---

## Best Practices

### Using Portainer

✅ **Do:**
- Use Portainer for monitoring and logs
- Use Portainer for quick restarts
- Use Portainer Stacks for organized management

⚠️ **Don't:**
- Manually edit containers (use Stacks instead)
- Forget to pull latest code before redeploying
- Skip running migrations after updates

### Recommended Workflow

1. **Development:** Work locally, push to GitHub
2. **Deploy:** SSH to server, pull latest code
3. **Update:** Use Portainer to restart stack
4. **Monitor:** Use Portainer logs and stats
5. **Manage:** Use Portainer for day-to-day operations

---

## Quick Reference

### Portainer Endpoints

- **Dashboard:** http://10.10.0.3:9091
- **Stacks:** http://10.10.0.3:9091/#!/stacks
- **Containers:** http://10.10.0.3:9091/#!/containers

### Common Tasks

| Task | Portainer Method |
|------|-----------------|
| View logs | Containers → Select → Logs |
| Restart app | Containers → Select → Restart |
| Update app | Stacks → Editor → Update |
| Run migration | Containers → Console → Run command |
| Monitor resources | Containers → Select → Stats |
| Backup volume | Volumes → Select → Backup |

---

## Summary

With Portainer installed, you get:
- 🖥️ **GUI Management** - No need for complex Docker commands
- 📊 **Monitoring** - Real-time stats and logs
- 🔄 **Easy Updates** - One-click stack updates
- 💾 **Backup Tools** - Volume management
- 🎯 **Stack Management** - Organized container groups

**Recommended approach:**
1. Use command line for initial deployment (faster)
2. Use Portainer for ongoing management (easier)
3. Use `deploy-ssh.ps1` for quick updates from your Windows machine
