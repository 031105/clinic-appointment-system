# 🏥 Clinic Appointment System

A comprehensive web-based clinic management system built with Next.js 14, Node.js/Express, and PostgreSQL. This system provides functionality for managing patients, doctors, appointments, and administrative tasks with role-based access control.

## ✨ Key Features

### 🔐 Authentication & Authorization
- **Multi-role System**: Admin, Doctor, and Patient roles
- **JWT-based Authentication**: Secure token-based authentication
- **Email Verification**: Account verification via EmailJS
- **Password Reset**: Secure password reset functionality
- **Role-based Access Control**: Different interfaces for different user types

### 👥 User Management
- **Admin Dashboard**: Complete user management for administrators
- **Profile Management**: User profile updates and image uploads
- **Department Management**: Manage medical departments and services
- **User Status Management**: Active/inactive user status control

### 📅 Appointment System
- **Appointment Booking**: Patients can book appointments with doctors
- **Appointment Management**: Doctors and admins can manage appointments
- **Status Tracking**: Multiple appointment statuses (scheduled, completed, cancelled)
- **Calendar Integration**: Full calendar view with appointment management

### 📊 Dashboard Analytics
- **Admin Dashboard**: System-wide statistics and analytics
- **Doctor Dashboard**: Doctor-specific appointment and patient statistics
- **Patient Dashboard**: Personal appointment history and upcoming visits

### 🏥 Medical Records
- **Patient Records**: Comprehensive patient information management  
- **Medical History**: Track patient medical history and treatments
- **Doctor Notes**: Medical notes and observations
- **Report Generation**: Generate medical reports

## 🚀 Quick Start

### Prerequisites
- Node.js 18.0.0 or higher
- PostgreSQL 14.0 or higher
- npm or yarn package manager

### 🎯 Quick Setup

1. **Get the Project**
   ```bash
   git clone https://github.com/031105/clinic-appointment-system.git
   cd clinic-appointment-system
   ```

2. **Database Setup**
   ```bash
   cd db_setup
   ./setup_database.sh
   cd ..
   ```

3. **Install Dependencies & Start**
   ```bash
   npm install
   cd server && npm install && cd ..
   ./start.sh
   ```

4. **Access the System**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

### 🔧 Manual Setup

#### 1. Database Setup
```bash
# Create PostgreSQL database
createdb -U postgres clinic_appointment_system

# Import database schema
cd db_setup
psql -U postgres -d clinic_appointment_system -f database_schema.sql

# Import data from CSV files
# Example for one table:
psql -U postgres -d clinic_appointment_system -c "\COPY roles FROM 'roles.csv' WITH CSV"
# Repeat for other CSV files in the correct order
```

#### 2. Environment Configuration
Create `.env.local` in root directory:
```bash
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/clinic_appointment_system

# EmailJS Configuration
EMAILJS_SERVICE_ID=your_service_id
EMAILJS_TEMPLATE_ID_VERIFICATION=your_verification_template
EMAILJS_TEMPLATE_ID_RESET_PASSWORD=your_reset_template
EMAILJS_PUBLIC_KEY=your_public_key

# Application URLs
FRONTEND_URL=http://localhost:3000
API_URL=http://localhost:3001/api/v1
```

Create `server/.env`:
```bash
# Server Configuration
NODE_ENV=development
PORT=3001
API_PREFIX=/api/v1
FRONTEND_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/clinic_appointment_system

# JWT Secrets
JWT_SECRET=your-jwt-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_RESET_SECRET=your-reset-secret-key
JWT_VERIFY_EMAIL_SECRET=your-verify-email-secret

# EmailJS (same as frontend)
EMAILJS_SERVICE_ID=your_service_id
EMAILJS_TEMPLATE_ID_VERIFICATION=your_verification_template
EMAILJS_TEMPLATE_ID_RESET_PASSWORD=your_reset_template
EMAILJS_PUBLIC_KEY=your_public_key

# Upload Configuration
UPLOAD_DIR=uploads
MAX_FILE_SIZE=5242880

# Rate Limiting
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
```

#### 3. Install Dependencies
```bash
# Frontend dependencies
npm install

# Backend dependencies
cd server
npm install
cd ..
```

#### 4. Start the Application
```bash
# Development mode
npm run dev

# Or start frontend and backend separately
# Terminal 1:
cd server && npm run dev

# Terminal 2:
npm run dev
```

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Query (@tanstack/react-query)
- **UI Components**: Radix UI primitives
- **Forms**: Custom form handling with Zod validation
- **Charts**: Recharts for analytics
- **Icons**: Lucide React & Heroicons
- **Calendar**: FullCalendar with React integration
- **Notifications**: React Hot Toast

### Backend
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL with raw SQL queries
- **Authentication**: JWT tokens with multiple secrets
- **Validation**: Zod schema validation & Joi
- **Email Service**: EmailJS (not SMTP)
- **Logging**: Winston logger
- **Security**: Helmet, CORS, Rate limiting
- **File Upload**: Multer for image handling

### Database
- **PostgreSQL Features**:
  - Comprehensive schema with foreign keys
  - User roles and permissions
  - Appointment management tables
  - Medical records and history
  - Department and service management
  - System settings and configurations

## 📁 Project Structure

```
clinic-appointment-system/
├── 📁 Frontend (Next.js 14)
│   ├── src/app/                 # App Router pages
│   │   ├── (admin-interface)/   # Admin pages
│   │   ├── (doctor-interface)/  # Doctor pages  
│   │   ├── (user-interface)/    # Patient pages
│   │   ├── (auth)/              # Authentication pages
│   │   └── api/                 # API routes (frontend)
│   ├── src/components/          # React components
│   │   ├── admin/               # Admin-specific components
│   │   ├── doctor/              # Doctor-specific components
│   │   └── ui/                  # Reusable UI components
│   ├── src/contexts/            # React contexts
│   ├── src/hooks/               # Custom React hooks
│   ├── src/lib/                 # Utility libraries
│   └── src/types/               # TypeScript type definitions
├── 📁 Backend (Node.js/Express)
│   ├── server/src/controllers/  # Route controllers
│   ├── server/src/routes/       # API route definitions
│   ├── server/src/middleware/   # Express middleware
│   ├── server/src/schemas/      # Validation schemas
│   ├── server/src/utils/        # Utility functions
│   ├── server/src/config/       # Configuration files
│   └── server/src/migrations/   # Database migrations
├── 📁 Database Setup
│   ├── db_setup/                # Database deployment scripts
│   │   ├── database_schema.sql  # Database schema
│   │   ├── *.csv                # CSV data files for each table
│   │   └── setup_database.sh    # Database setup script
└── 📁 Configuration
    ├── package.json             # Frontend dependencies
    ├── server/package.json      # Backend dependencies
    ├── start.sh                 # Application startup script
    └── .env.local               # Environment variables
```

## 🔗 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout
- `POST /api/v1/auth/forgot-password` - Password reset request
- `POST /api/v1/auth/reset-password` - Password reset

### Admin Routes
- `GET /api/v1/admin/dashboard` - Admin dashboard statistics
- `GET /api/v1/admin/users` - Manage users
- `GET /api/v1/admin/appointments` - Manage appointments
- `GET /api/v1/admin/departments` - Manage departments
- `GET /api/v1/admin/patients` - Manage patients
- `GET /api/v1/admin/settings` - System settings

### Doctor Routes
- `GET /api/v1/doctor/dashboard` - Doctor dashboard
- `GET /api/v1/doctor/appointments` - Doctor appointments
- `GET /api/v1/doctor/patients` - Doctor patients
- `GET /api/v1/doctor/settings` - Doctor settings

### Patient Routes
- `GET /api/v1/appointments` - Patient appointments
- `GET /api/v1/user-dashboard` - Patient dashboard
- `POST /api/v1/appointments` - Book appointment
- `GET /api/v1/medical-records` - Medical records

## 🚀 Deployment

### Development
```bash
# Start development servers
npm run dev                    # Frontend (Next.js)
cd server && npm run dev       # Backend (Express)

# Or use the startup script
./start.sh
```

### Production Build
```bash
# Build backend
cd server && npm run build

# Build frontend
npm run build

# Start production
npm run start
```

### Database Backup & Restore
```bash
# Create backup
pg_dump clinic_appointment_system > backup.sql

# Restore backup
psql -d clinic_appointment_system -f backup.sql

# Export table data to CSV
psql -U postgres -d clinic_appointment_system -c "COPY table_name TO 'table_name.csv' WITH CSV"
```

## 🛡️ Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access Control**: Strict permission system
- **Rate Limiting**: API request rate limiting
- **CORS Protection**: Configured cross-origin resource sharing
- **Security Headers**: Helmet.js security headers
- **Input Validation**: Comprehensive input validation with Zod/Joi
- **SQL Injection Prevention**: Parameterized queries

## 🐛 Troubleshooting

### Common Issues

**Database Connection Issues:**
```bash
# Check PostgreSQL status
systemctl status postgresql

# Check database exists
psql -U postgres -l | grep clinic
```

**Port Already in Use:**
```bash
# Check what's using port 3000/3001
lsof -i :3000
lsof -i :3001

# Kill process if needed
kill -9 <PID>
```

**Email Not Working:**
- Verify EmailJS configuration in environment variables
- Check EmailJS service status and template IDs
- Ensure correct public key is configured

**Build Errors:**
```bash
# Clear Next.js cache
rm -rf .next

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## 📝 Default Test Accounts

After database setup, these accounts are available:
- **Admin**: Check the database for admin users
- **Doctor**: Check the database for doctor users  
- **Patient**: Check the database for patient users

*Note: Check the actual database content for correct login credentials*

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the ISC License - see the package.json for details.

## 🆘 Support

For support and questions:
1. Check the troubleshooting section above
2. Review the database setup guide in `db_setup/`
3. Check the GitHub issues for common problems
4. Ensure all environment variables are correctly configured

## 🔄 Recent Updates

### Database Setup
- Updated database setup to use CSV files for data import
- Consolidated setup scripts into a single `setup_database.sh` script
- Added support for importing data from CSV files

### UI Enhancements
- Added emoji icons to departments
- Improved doctor profile image handling with blob storage
- Enhanced UI components for better user experience

---

**🎉 Ready to deploy? Run `./db_setup/setup_database.sh` to set up your database and get started!** 