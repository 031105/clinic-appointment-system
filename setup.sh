#!/bin/bash

# Install Node.js and npm using nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm install 18
nvm use 18

# Install dependencies
npm install

# Initialize Prisma
npx prisma init

# Create public directory and add placeholder images
mkdir -p public
curl https://via.placeholder.com/150 > public/avatar-placeholder.png
curl https://via.placeholder.com/150 > public/logo.svg

# Create necessary directories
mkdir -p src/app/api
mkdir -p src/components/doctors
mkdir -p src/components/appointments
mkdir -p src/lib

# Make the script executable
chmod +x setup.sh 