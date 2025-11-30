#!/bin/bash

# Quick deployment script for Email Flows feature
# Run this on your Plesk server after pulling the latest code

set -e  # Exit on error

echo "🚀 Email Flows Deployment Script"
echo "=================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Detect Plesk Node.js installation
if [ -d "/opt/plesk/node" ]; then
    LATEST_NODE=$(ls -1 /opt/plesk/node/ | grep -E '^[0-9]+$' | sort -rn | head -1)
    if [ -n "$LATEST_NODE" ]; then
        NODE_PATH="/opt/plesk/node/${LATEST_NODE}/bin"
        NPM="${NODE_PATH}/npm"
        NPX="${NODE_PATH}/npx"
        NODE="${NODE_PATH}/node"
        export PATH="${NODE_PATH}:$PATH"

        echo -e "${GREEN}✓${NC} Found Plesk Node.js ${LATEST_NODE}"
        echo "Node: $($NODE --version)"
        echo "NPM: $($NPM --version)"
    else
        echo -e "${RED}✗${NC} No Node.js version found in /opt/plesk/node/"
        exit 1
    fi
else
    echo -e "${RED}✗${NC} Plesk Node.js directory not found"
    exit 1
fi

echo ""

# Pull latest code
echo "📥 Pulling latest code..."
git pull origin claude/course-platform-evaluation-01NdSi7g38F7t8kgjKybpXop
echo -e "${GREEN}✓${NC} Code updated"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
$NPM install
echo -e "${GREEN}✓${NC} Dependencies installed"
echo ""

# Run database migration
echo "🗄️  Applying database changes..."
$NPX prisma db push
echo -e "${GREEN}✓${NC} Database schema updated"
echo ""

# Regenerate Prisma Client
echo "🔧 Regenerating Prisma Client..."
$NPX prisma generate
echo -e "${GREEN}✓${NC} Prisma Client generated"
echo ""

# Build Next.js app
echo "🏗️  Building Next.js application..."
$NPM run build
echo -e "${GREEN}✓${NC} Build complete"
echo ""

echo "=================================="
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Go to Plesk → Domains → llgl.shluchimtalk.com → Node.js"
echo "2. Click 'Restart App'"
echo "3. Set up the cron job (see FLOWS_SETUP.md)"
echo "4. Create your first email flow at /admin/flows"
echo ""
echo "Documentation: See FLOWS_SETUP.md for complete setup guide"
echo "=================================="
