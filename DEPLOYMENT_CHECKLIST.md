# 🚀 Quick Deployment Checklist

## Pre-Deployment (On Production Server: 112.198.194.104)

- [ ] SSH into server: `ssh user@112.198.194.104`
- [ ] Check available ports: `./check-ports.sh`
- [ ] Note available APP_PORT: ______
- [ ] Note available DB_PORT: ______

## Configuration

- [ ] Create `.env.production` file
- [ ] Set `APP_PORT=______` (from available ports)
- [ ] Set `DB_PORT=______` (from available ports)
- [ ] Set secure `POSTGRES_PASSWORD`
- [ ] Update `DATABASE_URL` with correct DB_PORT
- [ ] Copy `.env.production` to `.env`

## Deployment via Docker Compose

```bash
# Start the stack
docker-compose -f docker-compose.prod.yml up -d

# Check logs
docker-compose -f docker-compose.prod.yml logs -f app
```

## Configure Nginx Proxy Manager (NPM)

- [ ] Open NPM: http://112.198.194.104:81
- [ ] Add Proxy Host
  - Domain: `christmas-feedback.yourdomain.com`
  - Forward to: `10.10.0.3`
  - Forward Port: `______` (your APP_PORT)
  - Enable: Cache, Block Exploits, Websockets
- [ ] Optional: Enable SSL/HTTPS

## Verification

- [ ] Check containers running: `docker ps | grep christmas`
- [ ] Test internal URL: `curl http://10.10.0.3:YOUR_APP_PORT`
- [ ] Test external URL: `http://112.198.194.104:YOUR_APP_PORT`
- [ ] Test via domain: `http://christmas-feedback.yourdomain.com`
- [ ] Open in browser and submit test feedback
- [ ] Check database: `npx prisma studio` or `docker exec christmas-feedback-db psql -U postgres -d christmas_feedback`

## Post-Deployment

- [ ] Set up automated backups
- [ ] Monitor logs for first 24 hours
- [ ] Document final configuration
- [ ] Share URL with team

## Final URLs

- **Internal**: http://10.10.0.3:______ (APP_PORT)
- **External**: http://112.198.194.104:______ (APP_PORT)
- **Domain**: http://______________________
- **Database**: 10.10.0.3:______ (DB_PORT)

## Rollback (if needed)

```bash
# Stop and remove containers
docker-compose -f docker-compose.prod.yml down

# Remove volumes (WARNING: deletes data!)
docker-compose -f docker-compose.prod.yml down -v
```

---

## Port Configuration Example

If ports 3000 and 5432 are taken:

**.env.production:**
```env
APP_PORT=3005
DB_PORT=5434
DATABASE_URL="postgresql://postgres:SecurePass123@10.10.0.3:5434/christmas_feedback?schema=public"
POSTGRES_PASSWORD=SecurePass123
```

**NPM Configuration:**
- Forward Port: `3005`

**Access URL:**
- http://10.10.0.3:3005
- http://112.198.194.104:3005

---

🎄 **Ready to deploy!** 🎄
