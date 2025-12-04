#!/bin/bash
# Production Server Initial Setup Script
# Run this on your production server (10.10.0.3) after cloning the repository

set -e

echo "🎄 Christmas Feedback System - Production Setup"
echo "==============================================="
echo ""

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
    echo "⚠️  Please don't run as root. Run as a regular user with sudo privileges."
    exit 1
fi

# 1. Create project directory
echo "📂 Creating project directory..."
sudo mkdir -p /opt/christmas-feedback
sudo chown -R $USER:$USER /opt/christmas-feedback
cd /opt/christmas-feedback

# 2. Clone repository
echo "📥 Cloning repository from GitHub..."
if [ -d ".git" ]; then
    echo "Repository already exists, pulling latest changes..."
    git pull origin main
else
    git clone https://github.com/tildemark/event-feedback.git .
fi

# 3. Check for Docker
echo ""
echo "🐳 Checking Docker installation..."
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed!"
    echo ""
    echo "Install Docker with:"
    echo "  curl -fsSL https://get.docker.com -o get-docker.sh"
    echo "  sudo sh get-docker.sh"
    echo "  sudo usermod -aG docker $USER"
    echo ""
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed!"
    echo ""
    echo "Install Docker Compose with:"
    echo "  sudo curl -L \"https://github.com/docker/compose/releases/latest/download/docker-compose-\$(uname -s)-\$(uname -m)\" -o /usr/local/bin/docker-compose"
    echo "  sudo chmod +x /usr/local/bin/docker-compose"
    echo ""
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"

# 4. Check for available ports
echo ""
echo "🔍 Checking for available ports..."
chmod +x check-ports.sh
./check-ports.sh

# 5. Create .env.production
echo ""
echo "📝 Creating production environment file..."

if [ ! -f .env.production ]; then
    cp .env.production.example .env.production
    
    # Generate random database password
    DB_PASSWORD=$(openssl rand -base64 16 | tr -d "=+/" | cut -c1-16)
    
    # Update .env.production
    sed -i "s/your_secure_password_here/$DB_PASSWORD/g" .env.production
    
    echo "✅ Created .env.production with random database password"
    echo ""
    echo "⚠️  IMPORTANT: Edit .env.production and set available ports!"
    echo ""
    echo "Run: nano .env.production"
    echo ""
    echo "Set these values:"
    echo "  APP_PORT=<available-port>  (e.g., 3001, 3002, etc.)"
    echo "  DB_PORT=<available-port>   (e.g., 5433, 5434, etc.)"
    echo ""
    
    read -p "Press Enter to edit .env.production now..." 
    nano .env.production
else
    echo "✅ .env.production already exists"
fi

# 6. Build and start containers
echo ""
echo "🐳 Building and starting Docker containers..."
docker-compose -f docker-compose.prod.yml up -d --build

# 7. Wait for services to start
echo ""
echo "⏳ Waiting for services to initialize..."
sleep 15

# 8. Run database migrations
echo ""
echo "📊 Running database migrations..."
docker exec christmas-feedback-app npx prisma migrate deploy

# 9. Check status
echo ""
echo "✅ Checking deployment status..."
docker ps --filter "name=christmas-feedback"

# 10. Get the app port
APP_PORT=$(grep APP_PORT .env.production | cut -d '=' -f2)

echo ""
echo "🎄 Setup Complete!"
echo "=================="
echo ""
echo "✅ Application is running on port: $APP_PORT"
echo "🌐 Local access: http://10.10.0.3:$APP_PORT"
echo ""
echo "📋 Next Steps:"
echo "1. Configure Nginx Proxy Manager to point to 10.10.0.3:$APP_PORT"
echo "2. Set up domain/subdomain"
echo "3. Enable SSL certificate"
echo "4. Test the application"
echo ""
echo "📊 View logs:"
echo "  docker-compose -f docker-compose.prod.yml logs -f"
echo ""
echo "🔄 Restart application:"
echo "  docker-compose -f docker-compose.prod.yml restart"
echo ""
echo "🛑 Stop application:"
echo "  docker-compose -f docker-compose.prod.yml down"
echo ""
