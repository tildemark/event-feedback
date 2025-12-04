#!/bin/bash
# Port Finder Script for Production Server
# Checks which ports are available

echo "🔍 Checking available ports on server..."
echo "========================================"
echo ""

# Function to check if port is in use
check_port() {
    local port=$1
    if netstat -tuln | grep -q ":$port "; then
        echo "❌ Port $port is IN USE"
        return 1
    else
        echo "✅ Port $port is AVAILABLE"
        return 0
    fi
}

# Check common application ports
echo "📱 Application Ports:"
for port in 3000 3001 3002 3003 3004 3005 8080 8081 8082 8888; do
    check_port $port
done

echo ""
echo "🗄️  Database Ports:"
# Check PostgreSQL ports
for port in 5432 5433 5434 5435; do
    check_port $port
done

echo ""
echo "💡 Recommendation:"
echo "   - Use an available APP_PORT for the application"
echo "   - Use an available DB_PORT for PostgreSQL"
echo "   - Update .env.production with these values"
echo ""
echo "Example .env.production configuration:"
echo "   APP_PORT=3001"
echo "   DB_PORT=5433"
echo "   DATABASE_URL=\"postgresql://postgres:PASSWORD@10.10.0.3:5433/christmas_feedback\""
