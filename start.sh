#!/bin/bash

# Color definitions
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}  Clinic Appointment System - Startup Script${NC}"
echo -e "${BLUE}======================================${NC}"

# Comprehensive process cleanup function - clean all related processes before startup
cleanup_all_processes() {
    echo -e "${PURPLE}======================================${NC}"
    echo -e "${PURPLE}  Cleaning existing processes...${NC}"
    echo -e "${PURPLE}======================================${NC}"
    
    local cleanup_performed=false
    
    # 0. Special handling: Stop all nodemon processes
    echo -e "${YELLOW}Stopping all nodemon processes...${NC}"
    local nodemon_pids=$(pgrep -f "nodemon" 2>/dev/null)
    if [ ! -z "$nodemon_pids" ]; then
        echo -e "${YELLOW}Found active nodemon processes, stopping...${NC}"
        echo "$nodemon_pids" | xargs kill -TERM 2>/dev/null || true
        sleep 3
        # If TERM signal is ineffective, use KILL signal
        local remaining_nodemon=$(pgrep -f "nodemon" 2>/dev/null)
        if [ ! -z "$remaining_nodemon" ]; then
            echo -e "${YELLOW}Force terminating stubborn nodemon processes...${NC}"
            echo "$remaining_nodemon" | xargs kill -9 2>/dev/null || true
        fi
        cleanup_performed=true
    fi
    
    # 1. Clean port-occupied processes (only 3000 and 3001)
    echo -e "${YELLOW}Checking and cleaning port occupations...${NC}"
    local ports=("3000" "3001")
    for port in "${ports[@]}"; do
        local pids=$(lsof -ti:$port 2>/dev/null)
        if [ ! -z "$pids" ]; then
            echo -e "${YELLOW}Found port $port occupied, cleaning...${NC}"
            echo "$pids" | xargs kill -9 2>/dev/null || true
            cleanup_performed=true
            sleep 1
            local remaining_pids=$(lsof -ti:$port 2>/dev/null)
            if [ ! -z "$remaining_pids" ]; then
                echo -e "${YELLOW}Port $port still occupied, executing force cleanup...${NC}"
                echo "$remaining_pids" | xargs kill -9 2>/dev/null || true
                sleep 2
            fi
        fi
    done
    
    # 2. Clean Node.js related processes (extended search scope)
    echo -e "${YELLOW}Cleaning Node.js related processes...${NC}"
    local node_pids=$(pgrep -f "node.*3000\|node.*3001\|npm.*dev\|next.*dev\|ts-node\|nodemon" 2>/dev/null)
    if [ ! -z "$node_pids" ]; then
        echo -e "${YELLOW}Found Node.js related processes, cleaning...${NC}"
        echo "$node_pids" | xargs kill -9 2>/dev/null || true
        cleanup_performed=true
        sleep 1
    fi
    
    # 3. Clean clinic related processes
    echo -e "${YELLOW}Cleaning clinic related processes...${NC}"
    local clinic_pids=$(pgrep -f "clinic\|appointment" 2>/dev/null)
    if [ ! -z "$clinic_pids" ]; then
        echo -e "${YELLOW}Found clinic related processes, cleaning...${NC}"
        echo "$clinic_pids" | xargs kill -9 2>/dev/null || true
        cleanup_performed=true
        sleep 1
    fi
    
    # 4. Clean package.json related dev processes
    echo -e "${YELLOW}Cleaning dev server processes...${NC}"
    local dev_pids=$(pgrep -f "next-dev\|next dev\|react-scripts\|vite" 2>/dev/null)
    if [ ! -z "$dev_pids" ]; then
        echo -e "${YELLOW}Found dev server processes, cleaning...${NC}"
        echo "$dev_pids" | xargs kill -9 2>/dev/null || true
        cleanup_performed=true
        sleep 1
    fi
    
    # 5. Additional safety cleanup - find processes containing specific keywords
    echo -e "${YELLOW}Executing additional safety cleanup...${NC}"
    local additional_pids=$(ps aux | grep -E "(localhost:300[01]|next.*start|npm.*start|express|redwood-broker)" | grep -v grep | awk '{print $2}' 2>/dev/null)
    if [ ! -z "$additional_pids" ]; then
        echo -e "${YELLOW}Found additional related processes, cleaning...${NC}"
        echo "$additional_pids" | xargs kill -9 2>/dev/null || true
        cleanup_performed=true
        sleep 1
    fi
    
    # 6. Final verification (enhanced version)
    echo -e "${YELLOW}Verifying port cleanup status...${NC}"
    for port in "3000" "3001"; do
        local attempts=0
        while [ $attempts -lt 5 ]; do
            if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
                echo -e "${RED}Warning: Port $port still occupied, attempting force cleanup (attempt $((attempts+1))/5)...${NC}"
                lsof -ti:$port | xargs kill -9 2>/dev/null || true
                sleep 2
                attempts=$((attempts+1))
            else
                break
            fi
        done
        
        # Final check
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            echo -e "${RED}Error: Port $port still occupied after multiple attempts${NC}"
            echo -e "${YELLOW}Listing occupied process details:${NC}"
            lsof -i :$port 2>/dev/null || true
        else
            echo -e "${GREEN}✓ Port $port confirmed free${NC}"
        fi
    done
    
    if [ "$cleanup_performed" = true ]; then
        echo -e "${GREEN}✓ Process cleanup completed${NC}"
        echo -e "${YELLOW}Waiting for system stabilization...${NC}"
        sleep 3
    else
        echo -e "${GREEN}✓ No cleanup needed, all ports are free${NC}"
    fi
    
    echo -e "${GREEN}======================================${NC}"
}

# Execute cleanup at script start
cleanup_all_processes

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js not installed. Please install Node.js first${NC}"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}Error: npm not installed. Please install npm first${NC}"
    exit 1
fi

# Get current script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Improved port checking function
check_port() {
    local port=$1
    local service=$2
    local max_attempts=3
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
            echo -e "${YELLOW}Attempt $attempt/$max_attempts: Port $port still occupied, force cleaning...${NC}"
            lsof -ti:$port | xargs kill -9 2>/dev/null || true
            sleep 2
            attempt=$((attempt + 1))
        else
            echo -e "${GREEN}✓ Port $port is free, available for $service${NC}"
            return 0
        fi
    done
    
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${RED}Error: Unable to free port $port after $max_attempts attempts${NC}"
        echo -e "${RED}Please manually check and close occupied processes: lsof -ti:$port | xargs kill -9${NC}"
        exit 1
    fi
}

# Check critical ports
echo -e "${BLUE}Checking port status...${NC}"
check_port 3001 "backend service"
check_port 3000 "frontend service"

echo -e "${YELLOW}Checking and installing dependencies...${NC}"

# Install root directory (frontend) dependencies
echo -e "${BLUE}Installing frontend dependencies...${NC}"
if [ ! -d "node_modules" ]; then
    npm install
else
    echo -e "${GREEN}Frontend dependencies already exist${NC}"
fi

# Install backend dependencies
echo -e "${BLUE}Installing backend dependencies...${NC}"
cd server
if [ ! -d "node_modules" ]; then
    npm install
else
    echo -e "${GREEN}Backend dependencies already exist${NC}"
fi

# Build backend (if needed)
echo -e "${BLUE}Building backend...${NC}"
npm run build

cd ..

# Ensure system settings data exists
echo -e "${BLUE}Ensuring system settings data exists...${NC}"
if command -v psql &> /dev/null; then
    # If psql is available, execute SQL file directly
    if [ -f "setup-admin-settings.sql" ]; then
        echo -e "${YELLOW}Setting up system settings data...${NC}"
        # Need to adjust according to actual database connection info
        # psql -d clinic_appointment_system -f setup-admin-settings.sql 2>/dev/null || true
        echo -e "${YELLOW}Please manually execute setup-admin-settings.sql file to set up system settings${NC}"
    fi
else
    echo -e "${YELLOW}PostgreSQL client not found, please manually execute the following SQL files:${NC}"
    echo -e "  - setup-admin-settings.sql"
fi

# Create log directory
mkdir -p logs

# Enhanced cleanup function (for script exit)
cleanup() {
    echo -e "\n${YELLOW}Shutting down services...${NC}"
    
    # Close frontend process (port 3000)
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    lsof -ti:3000 | xargs kill -9 2>/dev/null || true
    
    # Close backend process (port 3001)
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi
    lsof -ti:3001 | xargs kill -9 2>/dev/null || true
    
    # Additional cleanup of related processes
    pgrep -f "node.*3000\|node.*3001\|npm.*dev" | xargs kill -9 2>/dev/null || true
    
    echo -e "${GREEN}Services shut down${NC}"
    exit 0
}

# Capture Ctrl+C signal
trap cleanup SIGINT SIGTERM

echo -e "${GREEN}======================================${NC}"
echo -e "${GREEN}  Starting services...${NC}"
echo -e "${GREEN}======================================${NC}"

# Start backend server (port 3001)
echo -e "${BLUE}Starting backend server (port 3001)...${NC}"
cd server
# Ensure backend starts on port 3001
PORT=3001 npm run dev > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait for backend startup
echo -e "${YELLOW}Waiting for backend service to start...${NC}"
sleep 5

# Check if backend started successfully
if ! lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null; then
    echo -e "${RED}Error: Backend service failed to start${NC}"
    echo -e "${YELLOW}View backend log: tail -f logs/backend.log${NC}"
    exit 1
fi
echo -e "${GREEN}Backend service started on port 3001${NC}"

# Start frontend server (port 3000)
echo -e "${BLUE}Starting frontend server (port 3000)...${NC}"
# Ensure frontend starts on port 3000
PORT=3000 npm run dev > logs/frontend.log 2>&1 &
FRONTEND_PID=$!

# Wait for frontend startup
echo -e "${YELLOW}Waiting for frontend service to start...${NC}"
sleep 5

# Check if frontend started successfully
if ! lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null; then
    echo -e "${RED}Error: Frontend service failed to start${NC}"
    echo -e "${YELLOW}View frontend log: tail -f logs/frontend.log${NC}"
    cleanup
    exit 1
fi
echo -e "${GREEN}Frontend service started on port 3000${NC}"

echo -e "${GREEN}======================================${NC}"
echo -e "${GREEN}  Services startup completed!${NC}"
echo -e "${GREEN}======================================${NC}"
echo -e "${GREEN}Frontend URL: ${BLUE}http://localhost:3000${NC}"
echo -e "${GREEN}Backend URL: ${BLUE}http://localhost:3001${NC}"
echo -e "${GREEN}API Documentation: ${BLUE}http://localhost:3001/api/v1/health${NC}"
echo -e "${GREEN}Debug Page: ${BLUE}http://localhost:3000/debug-user${NC}"
echo -e "${YELLOW}View logs: ${NC}"
echo -e "  - Frontend log: tail -f logs/frontend.log"
echo -e "  - Backend log: tail -f logs/backend.log"
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"

# Keep script running
wait 