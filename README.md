# 🏥 Clinic Appointment System

A comprehensive web-based clinic management system built with Next.js, Node.js, and PostgreSQL. This system provides complete functionality for managing patients, doctors, appointments, medical records, and administrative tasks.

## ✨ Features

### 👥 User Management
- **Multi-role System**: Patients, Doctors, and Administrators
- **Secure Authentication**: Email verification, password reset, JWT tokens
- **Profile Management**: Complete user profiles with images and personal information
- **Role-based Permissions**: Different access levels for different user types

### 📅 Appointment Management
- **Online Booking**: Patients can book appointments with available doctors
- **Schedule Management**: Doctors can manage their availability and schedules
- **Appointment Status Tracking**: Scheduled, completed, cancelled, no-show statuses
- **Automated Reminders**: Email notifications for upcoming appointments
- **Appointment Types**: Checkup, follow-up, consultation, emergency

### 🏥 Medical Records
- **Patient History**: Complete medical history tracking
- **Diagnosis Records**: Detailed diagnosis and treatment records
- **Prescription Management**: Digital prescription handling
- **Medical Notes**: Doctor notes and patient observations
- **Allergy Tracking**: Patient allergy management
- **Emergency Contacts**: Emergency contact information

### 🏛️ Department Management
- **Department Structure**: Multiple medical departments
- **Service Catalog**: Department-specific services and procedures
- **Doctor Assignment**: Assign doctors to specific departments
- **Service Pricing**: Manage consultation fees and service costs

### 👨‍⚕️ Doctor Features
- **Doctor Profiles**: Detailed doctor information with specializations
- **Availability Management**: Set working hours and availability
- **Patient Reviews**: Review and rating system
- **Dashboard Analytics**: Appointment statistics and insights
- **Medical Record Access**: Access to patient medical histories

### 📊 Administrative Features
- **System Settings**: Configurable clinic settings and preferences
- **User Management**: Create and manage user accounts
- **Reports and Analytics**: Comprehensive reporting dashboard
- **Backup Management**: Database backup and restore functionality
- **Notification Settings**: Configure system-wide notifications

### 🔔 Notification System
- **Email Notifications**: Appointment confirmations, reminders, cancellations
- **In-app Notifications**: Real-time system notifications
- **Customizable Alerts**: Configurable notification preferences
- **SMS Integration**: Optional SMS notification support

## 🚀 Complete Setup Guide

This section provides a comprehensive, step-by-step guide to deploy the entire Clinic Appointment System from scratch on any compatible machine.

### 🎯 One-Click Deployment (Recommended for Beginners)

#### Step 1: Get the Project
```bash
# Option A: Download and extract the project files
# Download the project zip file and extract it to your desired location

# Option B: If using Git
git clone [your-repository-url]
cd clinic-appointment-system-latest
```

#### Step 2: One-Command Database Setup
```bash
# Navigate to database setup directory
cd db_setup

# Run the magical one-click deployment
./DEPLOY_EVERYTHING.sh
```

**What this does automatically:**
- 🔍 Detects your operating system (Ubuntu/CentOS/Fedora/macOS)
- 📦 Downloads and installs PostgreSQL if not present
- ⚙️ Configures PostgreSQL service to auto-start
- 🔐 Sets up database user and permissions
- 🗄️ Creates `clinic_appointment_system` database
- 📊 Imports all tables, data, and configurations
- ✅ Verifies everything works correctly
- 📋 Shows you connection details

#### Step 3: Application Setup
```bash
# Go back to project root
cd ..

# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..

# Copy database configuration template
cp db_setup/database_env_template.txt .env.local

# Start the entire application
npm run dev
```

#### Step 4: Access Your System
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Database**: localhost:5432

**🎉 That's it! Your clinic system is now running!**

---

### 🔧 Advanced Setup (For Developers)

#### Prerequisites Verification
```bash
# Check Node.js version (should be 18+)
node --version

# Check npm version
npm --version

# Check if PostgreSQL is installed (optional - script will install it)
pg_config --version
```

#### Detailed Step-by-Step Process

##### 1. Project Setup
```bash
# Clone the repository
git clone [repository-url]
cd clinic-appointment-system-latest

# Verify project structure
ls -la
# You should see: db_setup/, server/, src/, package.json, etc.
```

##### 2. Database Deployment (Three Options)

**Option A: Automated (Recommended)**
```bash
cd db_setup
./deploy.sh
```

**Option B: Database Only (PostgreSQL already installed)**
```bash
cd db_setup
./setup_database.sh
```

**Option C: Manual Setup**
```bash
# Create database
createdb -U postgres clinic_appointment_system

# Import complete backup
psql -U postgres -d clinic_appointment_system -f db_setup/complete_database_backup.sql

# Or step-by-step:
# psql -U postgres -d clinic_appointment_system -f db_setup/database_schema.sql
# psql -U postgres -d clinic_appointment_system -f db_setup/database_data.sql
# psql -U postgres -d clinic_appointment_system -f setup-admin-settings.sql
```

##### 3. Environment Configuration

**Create Environment Files:**
```bash
# Frontend environment (.env.local)
cp db_setup/database_env_template.txt .env.local

# Backend environment (server/.env)
cp db_setup/database_env_template.txt server/.env
```

**Essential Environment Variables:**
```bash
# Database Configuration
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/clinic_appointment_system
DB_HOST=localhost
DB_PORT=5432
DB_NAME=clinic_appointment_system
DB_USER=postgres
DB_PASSWORD=postgres

# EmailJS Configuration (Alternative email service)
EMAILJS_SERVICE_ID=your_service_id
EMAILJS_TEMPLATE_ID_VERIFICATION=your_template_id
EMAILJS_TEMPLATE_ID_RESET_PASSWORD=your_reset_template_id
EMAILJS_PUBLIC_KEY=your_public_key

# Application Configuration
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000
API_PREFIX=/api/v1

# File Upload Configuration
UPLOAD_DIR=uploads
MAX_FILE_SIZE=5242880

# Rate Limiting
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
```

##### 4. Dependencies Installation
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..

# Verify installations
npm list --depth=0
cd server && npm list --depth=0 && cd ..
```

##### 5. Build Process (For Production)
```bash
# Build backend TypeScript
cd server
npm run build
cd ..

# Build frontend (for production)
npm run build
```

##### 6. Start the Application

**Development Mode:**
```bash
# Option 1: Start everything with one command
npm run dev

# Option 2: Start services individually
# Terminal 1 - Backend
cd server && npm run dev

# Terminal 2 - Frontend
npm run dev:frontend

# Option 3: Use the provided startup script
./start.sh
```

**Production Mode:**
```bash
npm run start
```

##### 7. Verification and Testing

**Database Verification:**
```bash
# Connect to database
psql -h localhost -p 5432 -U postgres -d clinic_appointment_system

# Check tables
\dt

# Verify data
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM departments;
SELECT COUNT(*) FROM system_settings;

# Exit PostgreSQL
\q
```

**Application Health Check:**
```bash
# Check frontend
curl http://localhost:3000

# Check backend API
curl http://localhost:3001/api/v1/health

# Check specific endpoints
curl http://localhost:3001/api/v1/departments
```

**Test User Accounts:**
After setup, you can use these test accounts:

- **Admin**: admin@clinic.com / password123
- **Doctor**: dr.smith@clinic.com / password123
- **Patient**: patient@clinic.com / password123

#### 8. Post-Deployment Configuration

**System Settings (via Admin Panel):**
1. Login as admin
2. Go to Admin → Settings
3. Configure:
   - Clinic information
   - Working hours
   - Appointment settings
   - Notification preferences
   - Email settings

**Security Hardening:**
```bash
# Change default passwords
# Update JWT secrets
# Configure firewall
# Set up SSL certificates (for production)
# Configure backup schedules
```

---

### 🌍 Production Deployment

#### Server Requirements
- **OS**: Ubuntu 20.04+, CentOS 8+, or macOS
- **Memory**: 2GB+ RAM
- **Storage**: 10GB+ available space
- **Node.js**: 18.0.0+
- **PostgreSQL**: 14.0+

#### Production Checklist
- [ ] Secure database with strong passwords
- [ ] Configure environment variables properly
- [ ] Set up SSL certificates
- [ ] Configure reverse proxy (Nginx/Apache)
- [ ] Set up process manager (PM2)
- [ ] Configure firewall rules
- [ ] Set up automated backups
- [ ] Configure monitoring and logging
- [ ] Test email functionality
- [ ] Verify all features work correctly

#### Production Environment Setup
```bash
# Install PM2 for process management
npm install -g pm2

# Start application with PM2
pm2 start ecosystem.config.js

# Configure PM2 to start on boot
pm2 startup
pm2 save

# Set up automated backups
crontab -e
# Add: 0 2 * * * pg_dump clinic_appointment_system > /backup/db_$(date +\%Y\%m\%d).sql
```

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Query for server state
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React
- **UI Components**: Custom component library

### Backend
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL 14+
- **Authentication**: JWT with email verification
- **Validation**: Zod schema validation
- **Logging**: Winston logger
- **Email**: EmailJS integration
- **File Upload**: Multer for file handling

### Database
- **PostgreSQL Features**:
  - Custom enum types
  - Triggers and functions
  - Indexes for performance
  - Foreign key constraints
  - JSONB for flexible data storage
  - Full-text search capabilities

## 📁 Project Structure

```
clinic-appointment-system/
├── 🗂️ Frontend (Next.js)
│   ├── src/app/           # Next.js app router pages
│   ├── src/components/    # React components
│   ├── src/hooks/         # Custom React hooks
│   ├── src/lib/          # Utility functions and API clients
│   └── src/types/        # TypeScript type definitions
│
├── 🖥️ Backend (Node.js/Express)
│   ├── server/src/        # Server source code
│   │   ├── controllers/   # Request handlers
│   │   ├── routes/        # API route definitions
│   │   ├── schemas/       # Validation schemas
│   │   ├── middleware/    # Custom middleware
│   │   ├── utils/         # Utility functions
│   │   └── config/        # Configuration files
│   └── server/dist/       # Compiled JavaScript
│
├── 🗄️ Database Setup
│   ├── db_setup/          # Complete database deployment package
│   │   ├── DEPLOY_EVERYTHING.sh    # One-click deployment
│   │   ├── deploy.sh               # Advanced deployment
│   │   ├── setup_database.sh       # Database-only setup
│   │   ├── complete_database_backup.sql
│   │   ├── database_schema.sql
│   │   ├── database_data.sql
│   │   ├── database_setup_guide.md
│   │   ├── DEPLOYMENT_SUMMARY.md
│   │   └── database_env_template.txt
│   └── setup-admin-settings.sql
│
└── 📋 Configuration
    ├── package.json       # Frontend dependencies
    ├── tailwind.config.ts # Tailwind configuration
    ├── tsconfig.json      # TypeScript configuration
    └── start.sh          # Application startup script
```

## 🗄️ Database Schema

### Core Tables
- **users** - User accounts (patients, doctors, admins)
- **roles** - User role definitions and permissions
- **patients** - Patient-specific information
- **doctors** - Doctor profiles and specializations
- **departments** - Medical departments
- **appointments** - Appointment scheduling
- **medical_records** - Patient medical history
- **reviews** - Doctor reviews and ratings
- **notifications** - System notifications
- **system_settings** - Application configuration

### Supporting Tables
- **admins** - Administrator-specific data
- **email_verifications** - Email verification and OTP management
- **emergency_contacts** - Patient emergency contact information
- **patient_allergies** - Patient allergy records
- **services** - Medical services offered by departments

### Key Features
- 🔗 **Relational Integrity**: Proper foreign key relationships
- 📊 **Performance Optimized**: Strategic indexes and query optimization
- 🔧 **Extensible Design**: Easy to add new features and fields
- 🛡️ **Data Validation**: Database-level constraints and triggers

## 🔐 Security Features

- **Authentication**: JWT-based authentication with refresh tokens
- **Authorization**: Role-based access control
- **Data Validation**: Input validation on both client and server
- **SQL Injection Protection**: Parameterized queries
- **Password Security**: Bcrypt hashing with salt
- **File Upload Security**: Restricted file types and sizes
- **Rate Limiting**: API rate limiting protection
- **CORS Configuration**: Proper cross-origin resource sharing

## 📊 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Token refresh
- `POST /api/v1/auth/forgot-password` - Password reset

### Appointments
- `GET /api/v1/appointments` - List appointments
- `POST /api/v1/appointments` - Create appointment
- `PUT /api/v1/appointments/:id` - Update appointment
- `DELETE /api/v1/appointments/:id` - Cancel appointment

### Medical Records
- `GET /api/v1/medical-records` - List medical records
- `POST /api/v1/medical-records` - Create medical record
- `GET /api/v1/medical-records/:id` - Get specific record

### Admin Features
- `GET /api/v1/admin/users` - Manage users
- `GET /api/v1/admin/settings` - System settings
- `POST /api/v1/admin/departments` - Manage departments

## 🚨 Troubleshooting

### Common Setup Issues

#### 1. PostgreSQL Installation Problems
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib

# CentOS/RHEL
sudo yum install postgresql-server postgresql-contrib
sudo postgresql-setup initdb

# macOS (if Homebrew fails)
# Download from: https://www.postgresql.org/download/macosx/
```

#### 2. Database Connection Issues
```bash
# Check PostgreSQL status
pg_isready -h localhost -p 5432

# Check if PostgreSQL is running
sudo systemctl status postgresql  # Linux
brew services list | grep postgresql  # macOS

# Restart PostgreSQL
sudo systemctl restart postgresql  # Linux
brew services restart postgresql  # macOS

# Check PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-*.log  # Linux
tail -f /usr/local/var/log/postgres.log  # macOS
```

#### 3. Permission Issues
```bash
# Fix script permissions
chmod +x db_setup/*.sh
chmod +x start.sh

# PostgreSQL user issues
sudo -u postgres psql
# In psql: ALTER USER postgres PASSWORD 'postgres';
```

#### 4. Port Conflicts
```bash
# Check what's using port 3000/3001
lsof -i :3000
lsof -i :3001

# Kill process using port
kill -9 $(lsof -t -i:3000)
```

#### 5. Node.js/npm Issues
```bash
# Check Node.js version
node --version  # Should be 18+

# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### 6. Environment Variable Issues
```bash
# Verify .env.local exists and has correct values
cat .env.local

# Check if environment variables are loaded
echo $DATABASE_URL
```

### Error Messages and Solutions

**"Database does not exist"**
```bash
# Ensure database was created
createdb -U postgres clinic_appointment_system
```

**"relation does not exist"**
```bash
# Re-run database setup
cd db_setup && ./setup_database.sh
```

**"permission denied for database"**
```bash
# Fix PostgreSQL permissions
sudo -u postgres psql
ALTER USER postgres WITH SUPERUSER;
```

**"EADDRINUSE: address already in use"**
```bash
# Kill processes using the ports
killall node
# Or change ports in configuration
```

**"Module not found"**
```bash
# Reinstall dependencies
rm -rf node_modules
npm install
cd server && rm -rf node_modules && npm install
```

### Performance Issues

**Slow database queries:**
```sql
-- Check if indexes exist
\di

-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM appointments;
```

**High memory usage:**
```bash
# Monitor Node.js processes
top -p $(pgrep node)

# Use PM2 for production
npm install -g pm2
pm2 start ecosystem.config.js
pm2 monit
```

### Logs and Debugging

**Check application logs:**
```bash
# Frontend logs (browser console)
# Backend logs
tail -f server/logs/app.log

# Database logs
sudo tail -f /var/log/postgresql/postgresql-*.log
```

**Enable debug mode:**
```bash
# Add to .env.local
DEBUG=true
LOG_LEVEL=debug
```

## 🧪 Testing

```bash
# Run frontend tests
npm test

# Run backend tests
cd server && npm test

# Run end-to-end tests
npm run test:e2e

# Manual testing endpoints
curl -X GET http://localhost:3001/api/v1/health
curl -X GET http://localhost:3001/api/v1/departments
```

## 📈 Performance

- **Database**: Optimized queries with proper indexing
- **Frontend**: Next.js optimizations with code splitting
- **Caching**: React Query for efficient data caching
- **Images**: Optimized image loading and resizing
- **Bundle Size**: Tree shaking and lazy loading

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For issues and questions:
1. Check the troubleshooting section above
2. Review the database setup guide in `db_setup/database_setup_guide.md`
3. Check existing issues in the repository
4. Create a new issue with detailed information

## 🎯 Roadmap

- [ ] Mobile app development
- [ ] Telemedicine features
- [ ] Advanced reporting and analytics
- [ ] Integration with external medical systems
- [ ] Multi-language support
- [ ] Advanced scheduling algorithms

---

**Built with ❤️ for modern healthcare management**

### 📞 Quick Help

**Need immediate help?** Try these common solutions:

1. **One-command fix for most issues:**
   ```bash
   cd db_setup && ./DEPLOY_EVERYTHING.sh
   cd .. && npm install && cd server && npm install && cd .. && npm run dev
   ```

2. **Reset everything:**
   ```bash
   # Stop all processes
   killall node
   
   # Reset database
   dropdb -U postgres clinic_appointment_system
   cd db_setup && ./setup_database.sh && cd ..
   
   # Reinstall dependencies
   rm -rf node_modules server/node_modules
   npm install && cd server && npm install && cd ..
   
   # Start fresh
   npm run dev
   ```

3. **Check system health:**
   ```bash
   # Verify all services
   pg_isready && echo "✅ PostgreSQL OK" || echo "❌ PostgreSQL Failed"
   node --version && echo "✅ Node.js OK" || echo "❌ Node.js Failed"
   npm --version && echo "✅ npm OK" || echo "❌ npm Failed"
   ``` 