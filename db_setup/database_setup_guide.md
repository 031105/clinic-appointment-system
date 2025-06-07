# Clinic Appointment System - Database Setup Guide

This guide provides complete instructions for setting up the database for the Clinic Appointment System on a new machine.

## Prerequisites

1. **PostgreSQL 14 or higher** installed and running
2. **Database access** with superuser privileges (or ability to create databases and extensions)
3. **Command line access** to PostgreSQL tools (psql, pg_dump, pg_restore)

## Database Configuration

- **Database Name**: `clinic_appointment_system`
- **Default Username**: `postgres`
- **Default Password**: `postgres`
- **Default Port**: `5432`
- **Default Host**: `localhost`

## Quick Setup (Recommended)

### Option 1: Complete Database Restore

```bash
# 1. Create the database
createdb -U postgres clinic_appointment_system

# 2. Restore the complete database (schema + data)
psql -U postgres -d clinic_appointment_system -f complete_database_backup.sql
```

### Option 2: Step-by-Step Setup

```bash
# 1. Create the database
createdb -U postgres clinic_appointment_system

# 2. Set up schema only
psql -U postgres -d clinic_appointment_system -f database_schema.sql

# 3. Load sample/production data
psql -U postgres -d clinic_appointment_system -f database_data.sql

# 4. Load system settings
psql -U postgres -d clinic_appointment_system -f ../setup-admin-settings.sql
```

## Manual Setup Instructions

### 1. Create Database

```sql
-- Connect to PostgreSQL as superuser
CREATE DATABASE clinic_appointment_system;
\c clinic_appointment_system;
```

### 2. Install Required Extensions

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### 3. Create Custom Types

```sql
-- Enum types used in the system
CREATE TYPE appointment_status AS ENUM (
    'scheduled',
    'completed', 
    'cancelled',
    'no_show'
);

CREATE TYPE notification_type AS ENUM (
    'appointment',
    'reminder',
    'system',
    'message',
    'promotion',
    'other'
);

CREATE TYPE record_type AS ENUM (
    'consultation',
    'test',
    'procedure', 
    'hospitalization',
    'other'
);

CREATE TYPE review_status AS ENUM (
    'pending',
    'approved',
    'rejected'
);

CREATE TYPE severity_level AS ENUM (
    'mild',
    'moderate',
    'severe'
);

CREATE TYPE user_status AS ENUM (
    'active',
    'inactive',
    'suspended'
);
```

### 4. Run Schema Creation

Execute the `database_schema.sql` file to create all tables, functions, triggers, and indexes.

### 5. Load Initial Data

Execute the `database_data.sql` file to load any existing data.

### 6. Load System Settings

Execute the `../setup-admin-settings.sql` file to set up default system configurations.

## Database Structure Overview

### Core Tables

1. **users** - Main user accounts (patients, doctors, admins)
2. **roles** - User role definitions and permissions
3. **patients** - Patient-specific information
4. **doctors** - Doctor-specific information and profiles
5. **departments** - Hospital/clinic departments
6. **appointments** - Appointment scheduling and management
7. **medical_records** - Patient medical history and records
8. **reviews** - Doctor reviews and ratings
9. **notifications** - System notifications
10. **system_settings** - Application configuration

### Supporting Tables

- **admins** - Administrator-specific data
- **email_verifications** - Email verification and OTP management
- **emergency_contacts** - Patient emergency contact information
- **patient_allergies** - Patient allergy records
- **services** - Medical services offered by departments

## Verification Steps

After setup, verify the installation:

```sql
-- Check if all tables exist
\dt

-- Verify table counts
SELECT 
    schemaname,
    tablename,
    attname,
    typname,
    attlen,
    attnum,
    attnotnull,
    atthasdef
FROM pg_tables 
JOIN pg_attribute ON pg_tables.tablename = pg_attribute.attrelid::regclass::text
JOIN pg_type ON pg_attribute.atttypid = pg_type.oid
WHERE schemaname = 'public'
ORDER BY tablename, attnum;

-- Check system settings
SELECT COUNT(*) as settings_count FROM system_settings;

-- Verify core data exists
SELECT 'departments' as table_name, COUNT(*) as count FROM departments
UNION ALL
SELECT 'roles' as table_name, COUNT(*) as count FROM roles
UNION ALL
SELECT 'users' as table_name, COUNT(*) as count FROM users;
```

## Connection Configuration

Update your application's database configuration:

### Node.js/Express Configuration

```javascript
// In your config file
database: {
  host: 'localhost',
  port: 5432,
  database: 'clinic_appointment_system',
  username: 'postgres',
  password: 'postgres'
}
```

### Environment Variables

```bash
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/clinic_appointment_system
DB_HOST=localhost
DB_PORT=5432
DB_NAME=clinic_appointment_system
DB_USER=postgres
DB_PASSWORD=postgres
```

## Backup and Maintenance

### Creating Backups

```bash
# Complete backup (schema + data)
pg_dump -U postgres -h localhost clinic_appointment_system > backup_$(date +%Y%m%d_%H%M%S).sql

# Schema only backup
pg_dump -U postgres -h localhost --schema-only clinic_appointment_system > schema_backup.sql

# Data only backup
pg_dump -U postgres -h localhost --data-only --inserts clinic_appointment_system > data_backup.sql
```

### Maintenance Tasks

```sql
-- Clean up expired OTP records (run periodically)
SELECT cleanup_expired_otps();

-- Update database statistics
ANALYZE;

-- Vacuum tables for performance
VACUUM;
```

## Troubleshooting

### Common Issues

1. **Permission denied**: Ensure PostgreSQL user has proper privileges
2. **Extension not found**: Install PostgreSQL contrib package
3. **Connection refused**: Check PostgreSQL service is running
4. **Database exists**: Drop existing database if starting fresh

### Reset Database

```bash
# Warning: This will destroy all data
dropdb -U postgres clinic_appointment_system
createdb -U postgres clinic_appointment_system
psql -U postgres -d clinic_appointment_system -f complete_database_backup.sql
```

## Security Considerations

1. **Change default passwords** in production
2. **Create dedicated database user** instead of using postgres superuser
3. **Configure firewall rules** for database access
4. **Enable SSL connections** for production
5. **Regular backups** and backup testing
6. **Monitor database logs** for suspicious activity

## Support

For issues with database setup:
1. Check PostgreSQL logs
2. Verify all SQL files are present and readable
3. Ensure PostgreSQL version compatibility
4. Check system resources (disk space, memory)

---

**Note**: This database contains sample/development data. For production deployment, review and modify the data in `database_data.sql` as needed. 