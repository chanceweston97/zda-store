#!/bin/bash

# Medusa Storefront Deployment Script
# This script is run on EC2 when GitHub Actions triggers deployment

set -e  # Exit on error

echo "🚀 Starting Medusa Storefront Deployment..."

# Navigate to project directory
cd /opt/medusa/storefront || cd ~/zda-store || exit 1

# Pull latest changes
echo "📥 Pulling latest changes from GitHub..."
git pull origin main

# Install dependencies
echo "📦 Installing dependencies..."
npm install --production

# Build the application
echo "🔨 Building application..."
npm run build

# Restart the application
echo "🔄 Restarting application..."
if command -v pm2 &> /dev/null; then
    pm2 restart medusa-storefront || pm2 start npm --name medusa-storefront -- run start
elif systemctl is-active --quiet medusa-storefront; then
    sudo systemctl restart medusa-storefront
else
    echo "⚠️  No process manager found. Please restart manually:"
    echo "   pm2 restart medusa-storefront"
    echo "   OR"
    echo "   sudo systemctl restart medusa-storefront"
fi

echo "✅ Storefront deployment completed successfully!"
echo "📍 Check logs: pm2 logs medusa-storefront"

