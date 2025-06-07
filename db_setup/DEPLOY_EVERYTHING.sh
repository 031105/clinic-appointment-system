#!/bin/bash

# ONE-COMMAND DEPLOYMENT FOR CLINIC APPOINTMENT SYSTEM
# Just run: ./DEPLOY_EVERYTHING.sh
# This script does EVERYTHING automatically!

echo "================================================================"
echo "  🏥 CLINIC APPOINTMENT SYSTEM - ONE-CLICK DEPLOYMENT"
echo "================================================================"
echo ""
echo "🚀 This will install PostgreSQL and deploy your database automatically!"
echo "💻 Supports: Ubuntu, CentOS, Fedora, macOS"
echo "⏱️  Estimated time: 2-5 minutes"
echo ""

# Check if we're in the right directory
if [ ! -f "deploy.sh" ]; then
    echo "❌ Error: Please run this script from the db_setup directory"
    echo "📂 Make sure you're in the folder containing deploy.sh"
    exit 1
fi

# Run the master deployment script
echo "🔄 Starting automated deployment..."
echo ""

./deploy.sh

echo ""
echo "================================================================"
echo "🎉 DEPLOYMENT COMPLETE! Your clinic system database is ready!"
echo "================================================================" 