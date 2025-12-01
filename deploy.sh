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
RED='\033[0;31m'
NC='\033[0m' # No Color

# Detect Plesk Node.js installation
# Try to find npm in Plesk's Node.js directories
if [ -d "/opt/plesk/node" ]; then
    # Find the latest Node.js version installed
    LATEST_NODE=$(ls -1 /opt/plesk/node/ | grep -E '^[0-9]+$' | sort -rn | head -1)
    if [ -n "$LATEST_NODE" ]; then
        NODE_PATH="/opt/plesk/node/${LATEST_NODE}/bin"
        NPM="${NODE_PATH}/npm"
        NPX="${NODE_PATH}/npx"
        NODE="${NODE_PATH}/node"

        # Add to PATH so npm scripts can find node
        export PATH="${NODE_PATH}:$PATH"

        echo -e "${GREEN}✓${NC} Found Plesk Node.js ${LATEST_NODE} at ${NODE_PATH}"
        echo "Node version: $($NODE --version)"
        echo "NPM version: $($NPM --version)"
    else
        echo -e "${RED}✗${NC} No Node.js version found in /opt/plesk/node/"
        echo "Available versions:"
        ls -1 /opt/plesk/node/ || echo "None found"
        exit 1
    fi
else
    # Fall back to system npm if Plesk directory doesn't exist
    echo -e "${YELLOW}⚠️  Plesk Node.js directory not found, using system npm${NC}"
    NPM="npm"
    NPX="npx"
    NODE="node"
fi

echo "Using: $NPM"
echo ""

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
$NPM install
echo -e "${GREEN}✓${NC} Dependencies installed"
echo ""

# Generate Prisma Client
echo "🔧 Generating Prisma Client..."
$NPX prisma generate
echo -e "${GREEN}✓${NC} Prisma Client generated"
echo ""

# Push database schema
echo "🗄️  Setting up database..."
$NPX prisma db push
echo -e "${GREEN}✓${NC} Database schema created"
echo ""

# Build Next.js app
echo "🏗️  Building Next.js application..."
$NPM run build
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
