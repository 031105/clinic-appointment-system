#!/bin/bash

# Clinic Appointment System - Database Setup Script
# This script automates the database setup process for new deployments

set -e  # Exit on any error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default configuration
DB_NAME="clinic_appointment_system"
DB_USER="postgres"
DB_PASSWORD="postgres"
DB_HOST="localhost"
DB_PORT="5432"

# Function to print colored output
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

# Function to check if PostgreSQL is running
check_postgresql() {
    print_status "Checking PostgreSQL connection..."
    if pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" > /dev/null 2>&1; then
        print_success "PostgreSQL is running and accessible"
    else
        print_error "Cannot connect to PostgreSQL. Please ensure:"
        echo "  1. PostgreSQL is installed and running"
        echo "  2. Connection parameters are correct"
        echo "  3. User has proper permissions"
        exit 1
    fi
}

# Function to check if database exists
database_exists() {
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"
}

# Function to create database
create_database() {
    print_status "Creating database '$DB_NAME'..."
    if database_exists; then
        print_warning "Database '$DB_NAME' already exists"
        read -p "Do you want to drop and recreate it? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            print_status "Dropping existing database..."
            dropdb -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME"
            print_success "Database dropped"
        else
            print_error "Setup cancelled. Database already exists."
            exit 1
        fi
    fi
    
    createdb -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME"
    print_success "Database '$DB_NAME' created successfully"
}

# Function to setup database schema and data
setup_database() {
    print_status "Setting up database schema and data..."
    
    # Check if backup file exists
    if [ -f "complete_database_backup.sql" ]; then
        print_status "Restoring from complete backup..."
        psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "complete_database_backup.sql" > /dev/null 2>&1
        print_success "Database restored from complete backup"
    else
        print_warning "Complete backup not found. Using step-by-step setup..."
        
        # Schema setup
        if [ -f "database_schema.sql" ]; then
            print_status "Loading database schema..."
            psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "database_schema.sql" > /dev/null 2>&1
            print_success "Database schema loaded"
        else
            print_error "Schema file 'database_schema.sql' not found"
            exit 1
        fi
        
        # Data setup
        if [ -f "database_data.sql" ]; then
            print_status "Loading database data..."
            psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "database_data.sql" > /dev/null 2>&1
            print_success "Database data loaded"
        else
            print_warning "Data file 'database_data.sql' not found. Skipping data import."
        fi
    fi
    
    # System settings
    if [ -f "../setup-admin-settings.sql" ]; then
        print_status "Loading system settings..."
        psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "../setup-admin-settings.sql" > /dev/null 2>&1
        print_success "System settings loaded"
    else
        print_warning "System settings file not found. Skipping."
    fi
}

# Function to verify database setup
verify_setup() {
    print_status "Verifying database setup..."
    
    # Check table count
    TABLE_COUNT=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" | xargs)
    print_status "Found $TABLE_COUNT tables"
    
    # Check core tables exist
    CORE_TABLES=("users" "roles" "patients" "doctors" "departments" "appointments" "medical_records" "system_settings")
    MISSING_TABLES=()
    
    for table in "${CORE_TABLES[@]}"; do
        if ! psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT 1 FROM information_schema.tables WHERE table_name = '$table';" | grep -q 1; then
            MISSING_TABLES+=("$table")
        fi
    done
    
    if [ ${#MISSING_TABLES[@]} -eq 0 ]; then
        print_success "All core tables are present"
    else
        print_error "Missing core tables: ${MISSING_TABLES[*]}"
        exit 1
    fi
    
    # Check if system settings exist
    SETTINGS_COUNT=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM system_settings;" 2>/dev/null | xargs || echo "0")
    if [ "$SETTINGS_COUNT" -gt 0 ]; then
        print_success "System settings loaded ($SETTINGS_COUNT settings)"
    else
        print_warning "No system settings found"
    fi
    
    # Check if there are any users
    USER_COUNT=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM users;" 2>/dev/null | xargs || echo "0")
    print_status "Database contains $USER_COUNT users"
}

# Function to display connection info
display_connection_info() {
    echo
    print_success "Database setup completed successfully!"
    echo
    echo "Connection Details:"
    echo "  Database: $DB_NAME"
    echo "  Host: $DB_HOST"
    echo "  Port: $DB_PORT" 
    echo "  Username: $DB_USER"
    echo
    echo "Connection String:"
    echo "  postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME"
    echo
    echo "Environment Variables:"
    echo "  export DATABASE_URL=\"postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME\""
    echo "  export DB_HOST=\"$DB_HOST\""
    echo "  export DB_PORT=\"$DB_PORT\""
    echo "  export DB_NAME=\"$DB_NAME\""
    echo "  export DB_USER=\"$DB_USER\""
    echo "  export DB_PASSWORD=\"$DB_PASSWORD\""
    echo
}

# Main execution
main() {
    echo "=============================================="
    echo "  Clinic Appointment System Database Setup"
    echo "=============================================="
    echo
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --host)
                DB_HOST="$2"
                shift 2
                ;;
            --port)
                DB_PORT="$2"
                shift 2
                ;;
            --user)
                DB_USER="$2"
                shift 2
                ;;
            --password)
                DB_PASSWORD="$2"
                shift 2
                ;;
            --database)
                DB_NAME="$2"
                shift 2
                ;;
            -h|--help)
                echo "Usage: $0 [OPTIONS]"
                echo "Options:"
                echo "  --host HOST        Database host (default: localhost)"
                echo "  --port PORT        Database port (default: 5432)"
                echo "  --user USER        Database user (default: postgres)"
                echo "  --password PASS    Database password (default: postgres)"
                echo "  --database DB      Database name (default: clinic_appointment_system)"
                echo "  -h, --help         Show this help message"
                exit 0
                ;;
            *)
                print_error "Unknown option: $1"
                echo "Use -h or --help for usage information"
                exit 1
                ;;
        esac
    done
    
    # Set PGPASSWORD for automatic authentication
    export PGPASSWORD="$DB_PASSWORD"
    
    print_status "Using configuration:"
    echo "  Host: $DB_HOST"
    echo "  Port: $DB_PORT"
    echo "  User: $DB_USER"
    echo "  Database: $DB_NAME"
    echo
    
    # Execute setup steps
    check_postgresql
    create_database
    setup_database
    verify_setup
    display_connection_info
    
    print_success "Setup completed! Your database is ready to use."
}

# Run main function with all arguments
main "$@" 