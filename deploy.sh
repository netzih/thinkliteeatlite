#!/bin/bash

# Plesk Deployment Script for Think Lite Eat Lite
# This script sets up the application on a Plesk server

set -e  # Exit on error

echo "🚀 Think Lite Eat Lite - Plesk Deployment"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  No .env file found!${NC}"
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo ""
    echo -e "${YELLOW}📝 Please edit .env file with your actual values:${NC}"
    echo "   - DATABASE_URL (your PostgreSQL connection string)"
    echo "   - NEXT_PUBLIC_APP_URL (your domain)"
    echo "   - RESEND_API_KEY (from resend.com)"
    echo "   - NEXTAUTH_SECRET (generate with: openssl rand -base64 32)"
    echo ""
    echo "After editing .env, run this script again."
    exit 1
fi

echo -e "${GREEN}✓${NC} Found .env file"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install
echo -e "${GREEN}✓${NC} Dependencies installed"
echo ""

# Generate Prisma Client
echo "🔧 Generating Prisma Client..."
npx prisma generate
echo -e "${GREEN}✓${NC} Prisma Client generated"
echo ""

# Push database schema
echo "🗄️  Setting up database..."
npx prisma db push
echo -e "${GREEN}✓${NC} Database schema created"
echo ""

# Build Next.js app
echo "🏗️  Building Next.js application..."
npm run build
echo -e "${GREEN}✓${NC} Build complete"
echo ""

echo "=========================================="
echo -e "${GREEN}✅ Deployment setup complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Go to Plesk → Node.js for your domain"
echo "2. Configure:"
echo "   - Application startup file: server.js"
echo "   - Application mode: Production"
echo "   - Node.js version: 18.x or higher"
echo "3. Make sure environment variables are set in Plesk"
echo "4. Click 'Restart App'"
echo ""
echo "Your app should be live at: https://llgl.shluchimtalk.com"
echo "=========================================="
