#!/bin/bash

# Master Deployment Script for Clinic Appointment System
# This script handles EVERYTHING - PostgreSQL installation, setup, and database deployment
# Usage: ./deploy.sh

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

# System detection
OS=""
PACKAGE_MANAGER=""

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

# Function to detect operating system
detect_os() {
    print_step "Detecting operating system..."
    
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        if command -v apt-get &> /dev/null; then
            OS="ubuntu"
            PACKAGE_MANAGER="apt"
        elif command -v yum &> /dev/null; then
            OS="centos"
            PACKAGE_MANAGER="yum"
        elif command -v dnf &> /dev/null; then
            OS="fedora"
            PACKAGE_MANAGER="dnf"
        else
            OS="linux"
            PACKAGE_MANAGER="unknown"
        fi
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        OS="macos"
        if command -v brew &> /dev/null; then
            PACKAGE_MANAGER="brew"
        else
            PACKAGE_MANAGER="none"
        fi
    elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
        OS="windows"
        PACKAGE_MANAGER="choco"
    else
        OS="unknown"
        PACKAGE_MANAGER="unknown"
    fi
    
    print_success "Detected OS: $OS (Package Manager: $PACKAGE_MANAGER)"
}

# Function to check if PostgreSQL is installed
check_postgresql_installed() {
    if command -v psql &> /dev/null && command -v pg_ctl &> /dev/null; then
        return 0
    else
        return 1
    fi
}

# Function to install PostgreSQL
install_postgresql() {
    print_step "Installing PostgreSQL..."
    
    case $OS in
        "ubuntu")
            print_status "Installing PostgreSQL on Ubuntu/Debian..."
            sudo apt-get update
            sudo apt-get install -y postgresql postgresql-contrib
            ;;
        "centos")
            print_status "Installing PostgreSQL on CentOS..."
            sudo yum install -y postgresql-server postgresql-contrib
            sudo postgresql-setup initdb
            ;;
        "fedora")
            print_status "Installing PostgreSQL on Fedora..."
            sudo dnf install -y postgresql-server postgresql-contrib
            sudo postgresql-setup --initdb
            ;;
        "macos")
            if [[ "$PACKAGE_MANAGER" == "brew" ]]; then
                print_status "Installing PostgreSQL on macOS with Homebrew..."
                brew install postgresql
            else
                print_error "Homebrew not found. Please install Homebrew first:"
                echo "  /bin/bash -c \"\$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\""
                exit 1
            fi
            ;;
        "windows")
            print_status "For Windows, please download PostgreSQL from:"
            echo "  https://www.postgresql.org/download/windows/"
            echo "  Or use chocolatey: choco install postgresql"
            print_warning "After installation, run this script again."
            exit 1
            ;;
        *)
            print_error "Unsupported operating system: $OS"
            print_status "Please install PostgreSQL manually from: https://www.postgresql.org/download/"
            exit 1
            ;;
    esac
    
    print_success "PostgreSQL installation completed"
}

# Function to start PostgreSQL service
start_postgresql_service() {
    print_step "Starting PostgreSQL service..."
    
    case $OS in
        "ubuntu"|"debian")
            sudo systemctl start postgresql
            sudo systemctl enable postgresql
            ;;
        "centos"|"fedora")
            sudo systemctl start postgresql
            sudo systemctl enable postgresql
            ;;
        "macos")
            if command -v brew &> /dev/null; then
                brew services start postgresql
            else
                # Try manual start
                if [ -d "/opt/homebrew/var/postgres" ]; then
                    pg_ctl -D /opt/homebrew/var/postgres start
                elif [ -d "/usr/local/var/postgres" ]; then
                    pg_ctl -D /usr/local/var/postgres start
                fi
            fi
            ;;
    esac
    
    # Wait for PostgreSQL to start
    print_status "Waiting for PostgreSQL to start..."
    sleep 5
    
    # Check if PostgreSQL is running
    if pg_isready -h "$DB_HOST" -p "$DB_PORT" > /dev/null 2>&1; then
        print_success "PostgreSQL service is running"
    else
        print_warning "PostgreSQL might not be running yet, let's try to connect anyway..."
    fi
}

# Function to setup PostgreSQL user and permissions
setup_postgresql_user() {
    print_step "Setting up PostgreSQL user and permissions..."
    
    # Try to connect as postgres user
    if sudo -u postgres psql -c "SELECT version();" > /dev/null 2>&1; then
        print_status "Setting password for postgres user..."
        sudo -u postgres psql -c "ALTER USER postgres PASSWORD '$DB_PASSWORD';"
        print_success "PostgreSQL user setup completed"
    else
        print_warning "Could not connect as postgres user, trying alternative methods..."
        
        # Try direct connection
        if psql -U postgres -c "SELECT version();" > /dev/null 2>&1; then
            print_status "Connected directly, setting password..."
            psql -U postgres -c "ALTER USER postgres PASSWORD '$DB_PASSWORD';"
        else
            print_warning "Using default authentication. If connection fails, you may need to configure PostgreSQL authentication manually."
        fi
    fi
}

# Function to configure PostgreSQL authentication
configure_postgresql_auth() {
    print_step "Configuring PostgreSQL authentication..."
    
    # Find PostgreSQL configuration directory
    PG_VERSION=$(psql --version | grep -oE '[0-9]+\.[0-9]+' | head -1)
    
    case $OS in
        "ubuntu"|"debian")
            PG_CONFIG_DIR="/etc/postgresql/$PG_VERSION/main"
            ;;
        "centos"|"fedora")
            PG_CONFIG_DIR="/var/lib/pgsql/data"
            ;;
        "macos")
            if [ -d "/opt/homebrew/var/postgres" ]; then
                PG_CONFIG_DIR="/opt/homebrew/var/postgres"
            elif [ -d "/usr/local/var/postgres" ]; then
                PG_CONFIG_DIR="/usr/local/var/postgres"
            fi
            ;;
    esac
    
    if [ -n "$PG_CONFIG_DIR" ] && [ -f "$PG_CONFIG_DIR/pg_hba.conf" ]; then
        print_status "Updating pg_hba.conf for local connections..."
        
        # Create backup
        sudo cp "$PG_CONFIG_DIR/pg_hba.conf" "$PG_CONFIG_DIR/pg_hba.conf.backup.$(date +%Y%m%d_%H%M%S)" 2>/dev/null || true
        
        # Update authentication method for local connections
        if grep -q "local.*all.*postgres.*peer" "$PG_CONFIG_DIR/pg_hba.conf" 2>/dev/null; then
            sudo sed -i 's/local.*all.*postgres.*peer/local   all             postgres                                md5/' "$PG_CONFIG_DIR/pg_hba.conf" 2>/dev/null || true
        fi
        
        # Restart PostgreSQL to apply changes
        case $OS in
            "ubuntu"|"debian"|"centos"|"fedora")
                sudo systemctl restart postgresql
                ;;
            "macos")
                if command -v brew &> /dev/null; then
                    brew services restart postgresql
                fi
                ;;
        esac
        
        sleep 3
        print_success "PostgreSQL authentication configured"
    else
        print_warning "Could not find PostgreSQL configuration directory. Manual configuration may be needed."
    fi
}

# Function to verify PostgreSQL connection
verify_postgresql_connection() {
    print_step "Verifying PostgreSQL connection..."
    
    # Set password for connection
    export PGPASSWORD="$DB_PASSWORD"
    
    # Try different connection methods
    if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -c "SELECT version();" > /dev/null 2>&1; then
        print_success "PostgreSQL connection verified"
        return 0
    elif sudo -u postgres psql -c "SELECT version();" > /dev/null 2>&1; then
        print_warning "Connected as system postgres user"
        return 0
    elif psql -U postgres -c "SELECT version();" > /dev/null 2>&1; then
        print_warning "Connected with default authentication"
        return 0
    else
        print_error "Cannot connect to PostgreSQL"
        return 1
    fi
}

# Function to run database setup
run_database_setup() {
    print_step "Running database setup..."
    
    # Make sure setup script is executable
    chmod +x ./setup_database.sh
    
    # Run the database setup script
    ./setup_database.sh --host "$DB_HOST" --port "$DB_PORT" --user "$DB_USER" --password "$DB_PASSWORD" --database "$DB_NAME"
    
    print_success "Database setup completed successfully"
}

# Function to display final information
display_final_info() {
    print_header "DEPLOYMENT COMPLETED SUCCESSFULLY!"
    
    echo -e "${GREEN}✅ PostgreSQL is installed and running${NC}"
    echo -e "${GREEN}✅ Database '$DB_NAME' has been created and populated${NC}"
    echo -e "${GREEN}✅ All tables, data, and settings have been imported${NC}"
    echo
    echo -e "${CYAN}Database Connection Information:${NC}"
    echo "  Host: $DB_HOST"
    echo "  Port: $DB_PORT"
    echo "  Database: $DB_NAME"
    echo "  Username: $DB_USER"
    echo "  Password: $DB_PASSWORD"
    echo
    echo -e "${CYAN}Connection String:${NC}"
    echo "  postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME"
    echo
    echo -e "${CYAN}Quick Test:${NC}"
    echo "  psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME"
    echo
    echo -e "${YELLOW}⚠️  IMPORTANT SECURITY NOTES:${NC}"
    echo "  • Change the default password in production!"
    echo "  • Configure firewall rules for database access"
    echo "  • Enable SSL for production environments"
    echo "  • Set up regular database backups"
    echo
    print_success "Your Clinic Appointment System database is ready to use!"
}

# Main execution function
main() {
    print_header "CLINIC APPOINTMENT SYSTEM - AUTOMATED DEPLOYMENT"
    
    echo -e "${BLUE}This script will:${NC}"
    echo "  1. Detect your operating system"
    echo "  2. Install PostgreSQL (if not present)"
    echo "  3. Configure PostgreSQL service"
    echo "  4. Set up database user and permissions"
    echo "  5. Create and populate the clinic database"
    echo "  6. Verify the installation"
    echo
    
    # Ask for confirmation
    read -p "Do you want to proceed with automated deployment? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_status "Deployment cancelled by user."
        exit 0
    fi
    
    # Parse command line arguments for custom configuration
    while [[ $# -gt 0 ]]; do
        case $1 in
            --password)
                DB_PASSWORD="$2"
                shift 2
                ;;
            --help)
                echo "Usage: $0 [OPTIONS]"
                echo "Options:"
                echo "  --password PASS    Set custom database password (default: postgres)"
                echo "  --help             Show this help message"
                exit 0
                ;;
            *)
                shift
                ;;
        esac
    done
    
    # Execute deployment steps
    detect_os
    
    # Check if PostgreSQL is already installed
    if check_postgresql_installed; then
        print_success "PostgreSQL is already installed"
    else
        install_postgresql
    fi
    
    start_postgresql_service
    setup_postgresql_user
    configure_postgresql_auth
    
    if verify_postgresql_connection; then
        run_database_setup
        display_final_info
    else
        print_error "Database setup failed. Please check PostgreSQL installation and try again."
        exit 1
    fi
}

# Check if script is being run from the correct directory
if [ ! -f "setup_database.sh" ] || [ ! -f "complete_database_backup.sql" ]; then
    print_error "Please run this script from the db_setup directory"
    print_status "Expected files: setup_database.sh, complete_database_backup.sql"
    exit 1
fi

# Run main function with all arguments
main "$@" 