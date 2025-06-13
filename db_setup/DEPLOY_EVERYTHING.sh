#!/bin/bash

# One-Click Deployment Script for Clinic Appointment System
# This script handles database schema and data deployment
# Usage: ./DEPLOY_EVERYTHING.sh

set -e  # Exit on any error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Default configuration
DB_NAME="clinic_appointment_system"
DB_USER="postgres"
DB_PASSWORD="postgres"
DB_HOST="localhost"
DB_PORT="5432"

# Function to print colored output
print_header() {
    echo -e "${PURPLE}================================================================${NC}"
    echo -e "${PURPLE}  $1${NC}"
    echo -e "${PURPLE}================================================================${NC}"
}

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "${CYAN}[STEP]${NC} $1"
}

# Function to check if PostgreSQL is installed
check_postgresql_installed() {
    if ! command -v psql &> /dev/null; then
        print_error "PostgreSQL is not installed. Please install PostgreSQL first."
        print_status "For macOS: brew install postgresql"
        print_status "For Ubuntu: sudo apt-get install postgresql"
        print_status "For Windows: Download from https://www.postgresql.org/download/windows/"
        exit 1
    fi
}

# Function to check if PostgreSQL is running
check_postgresql_running() {
    if ! pg_isready -h "$DB_HOST" -p "$DB_PORT" > /dev/null 2>&1; then
        print_error "PostgreSQL is not running. Please start PostgreSQL first."
        print_status "For macOS: brew services start postgresql"
        print_status "For Ubuntu: sudo systemctl start postgresql"
        print_status "For Windows: Start PostgreSQL service from Services"
        exit 1
    fi
}

# Function to check if we're in the correct directory
check_directory() {
    if [ ! -f "database_schema.sql" ] || [ ! -f "database_data.sql" ]; then
        print_error "Required files not found. Please run this script from the db_setup directory."
        print_status "Current directory: $(pwd)"
        print_status "Required files:"
        print_status "  - database_schema.sql"
        print_status "  - database_data.sql"
        exit 1
    fi
}

# Function to check PostgreSQL connection
check_postgresql_connection() {
    if ! PGPASSWORD="$DB_PASSWORD" psql -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -c "SELECT 1" > /dev/null 2>&1; then
        print_error "Cannot connect to PostgreSQL with the current settings:"
        print_status "User: $DB_USER"
        print_status "Host: $DB_HOST"
        print_status "Port: $DB_PORT"
        print_status ""
        print_status "Please check your PostgreSQL configuration and try again."
        exit 1
    fi
}

# Function to create database
create_database() {
    print_step "Creating database..."
    
    if PGPASSWORD="$DB_PASSWORD" psql -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
        print_warning "Database $DB_NAME already exists. Dropping it..."
        PGPASSWORD="$DB_PASSWORD" psql -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -c "DROP DATABASE $DB_NAME;"
    fi
    
    PGPASSWORD="$DB_PASSWORD" psql -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -c "CREATE DATABASE $DB_NAME;"
    print_success "Database created successfully"
}

# Function to import schema
import_schema() {
    print_step "Importing database schema..."
    
    if [ -f "database_schema.sql" ]; then
        PGPASSWORD="$DB_PASSWORD" psql -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -d "$DB_NAME" -f database_schema.sql
        print_success "Schema imported successfully"
    else
        print_error "Schema file not found: database_schema.sql"
        exit 1
    fi
}

# Function to import data
import_data() {
    print_step "Importing database data..."
    
    if [ -f "database_data.sql" ]; then
        PGPASSWORD="$DB_PASSWORD" psql -U "$DB_USER" -h "$DB_HOST" -p "$DB_PORT" -d "$DB_NAME" -f database_data.sql
        print_success "Data imported successfully"
    else
        print_error "Data file not found: database_data.sql"
        exit 1
    fi
}

# Main execution
print_header "Starting Clinic Appointment System Database Deployment"

# Check prerequisites
check_postgresql_installed
check_postgresql_running
check_directory
check_postgresql_connection

# Create database
create_database

# Import schema
import_schema

# Import data
import_data

print_header "Deployment Completed Successfully!"
print_status "Database: $DB_NAME"
print_status "User: $DB_USER"
print_status "Host: $DB_HOST"
print_status "Port: $DB_PORT"

print_status ""
print_status "To connect to the database, use:"
print_status "psql -U $DB_USER -h $DB_HOST -p $DB_PORT -d $DB_NAME"
print_status ""
print_status "Or set these environment variables in your .env file:"
print_status "DATABASE_URL=postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME" 