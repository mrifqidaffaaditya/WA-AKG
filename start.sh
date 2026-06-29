#!/bin/bash

# ==============================================================================
# 🚀 WA-AKG Auto Deployment & Startup Script
# ==============================================================================

# Text Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}====================================================${NC}"
echo -e "${BLUE}       ⚡ WA-AKG PM2 AUTO STARTUP SCRIPT ⚡        ${NC}"
echo -e "${BLUE}====================================================${NC}"

# Step 1: Check for .env file
echo -e "\n${BLUE}[1/5] Checking configuration file...${NC}"
if [ ! -f .env ]; then
    echo -e "${RED}❌ Error: .env file not found!${NC}"
    echo -e "${YELLOW}Please create a .env file first (copy from .env.example) and configure your database and authentication secret.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ .env configuration file found.${NC}"

# Step 2: Install dependencies
echo -e "\n${BLUE}[2/5] Installing project dependencies...${NC}"
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error: Failed to install npm packages!${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Dependencies installed successfully.${NC}"

# Step 3: Run Database Schema Sync
echo -e "\n${BLUE}[3/5] Syncing database schema with Prisma...${NC}"
npx prisma db push
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error: Database schema push failed!${NC}"
    echo -e "${YELLOW}Please check your DATABASE_URL in the .env file and ensure the database server is running.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Database schema is up to date.${NC}"

# Step 4: Build Next.js Production Assets
echo -e "\n${BLUE}[4/5] Building Next.js production assets...${NC}"
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error: Next.js build failed!${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Production assets built successfully.${NC}"

# Step 5: Start / Reload in PM2
echo -e "\n${BLUE}[5/5] Deploying process in PM2...${NC}"

# Check if pm2 command exists
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}⚠️ PM2 is not installed globally. Installing globally...${NC}"
    npm install -g pm2
fi

# Check if application is already running in PM2
if pm2 show wa-akg &> /dev/null; then
    echo -e "${YELLOW}🔄 Application 'wa-akg' is already running. Reloading to apply changes...${NC}"
    pm2 reload wa-akg
else
    echo -e "${GREEN}🚀 Starting 'wa-akg' process using ecosystem.config.js...${NC}"
    pm2 start ecosystem.config.js
fi

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error: Failed to start PM2 process!${NC}"
    exit 1
fi

echo -e "\n${GREEN}====================================================${NC}"
echo -e "${GREEN}       🎉 WA-AKG DEPLOYED SUCCESSFULLY! 🎉         ${NC}"
echo -e "${GREEN}====================================================${NC}"
echo -e "\n${BLUE}Useful PM2 Commands:${NC}"
echo -e "  - View status:  ${YELLOW}pm2 status${NC}"
echo -e "  - View logs:    ${YELLOW}pm2 logs wa-akg${NC}"
echo -e "  - Stop service: ${YELLOW}pm2 stop wa-akg${NC}"
echo -e "\n${YELLOW}To enable auto-start on server reboot, run:${NC}"
echo -e "  ${GREEN}pm2 startup${NC}"
echo -e "  ${GREEN}pm2 save${NC}"
echo -e "${BLUE}====================================================${NC}\n"
