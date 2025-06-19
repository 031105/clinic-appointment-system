# Database Setup Guide

This directory contains the database schema and data files for the Clinic Appointment System.

## Quick Setup

To set up the database with a single command:

```bash
./setup_database.sh
```

This script will:
1. Create the database
2. Import the database schema from `database_schema.sql`
3. Import data from CSV files into their respective tables
4. Verify the setup was successful

## CSV Data Files

The following CSV files contain the exported data for each table:

- `roles.csv` - User roles and permissions
- `users.csv` - User accounts
- `departments.csv` - Medical departments
- `doctors.csv` - Doctor profiles
- `patients.csv` - Patient profiles
- `services.csv` - Medical services
- `admins.csv` - Admin accounts
- `appointments.csv` - Appointment records
- `medical_records.csv` - Patient medical records
- `emergency_contacts.csv` - Patient emergency contacts
- `patient_allergies.csv` - Patient allergy information
- `reviews.csv` - Doctor reviews
- `notifications.csv` - User notifications
- `system_settings.csv` - System configuration
- `email_verifications.csv` - Email verification records

## Custom Configuration

You can customize the database connection parameters:

```bash
./setup_database.sh --host localhost --port 5432 --user postgres --password your_password --database clinic_appointment_system
```

## Manual Setup

If you prefer to set up the database manually:

1. Create the database:
   ```bash
   createdb -U postgres clinic_appointment_system
   ```

2. Import the schema:
   ```bash
   psql -U postgres -d clinic_appointment_system -f database_schema.sql
   ```

3. Import data from CSV files:
   ```bash
   # Example for one table
   psql -U postgres -d clinic_appointment_system -c "\COPY roles FROM 'roles.csv' WITH CSV"
   
   # Repeat for each CSV file
   ```

## System Requirements

- **PostgreSQL**: Must be installed and running
- **Privileges**: User must have permission to create databases and tables
- **Disk Space**: ~50MB for the database

## Verification

After deployment, the script will show you:
- ✅ Connection details
- ✅ Connection string
- ✅ Environment variables to use

You can verify manually:
```sql
psql -h localhost -p 5432 -U postgres -d clinic_appointment_system
\dt  -- List all tables
SELECT COUNT(*) FROM users;  -- Check data
```

## Troubleshooting

If you encounter issues during setup:

1. Ensure PostgreSQL is installed and running
2. Verify the database user has appropriate permissions
3. Check that the CSV files are properly formatted
4. Look for error messages in the script output

For more detailed information, refer to the `db_complete_documentation.md` file.

## Security Notes

⚠️ **Important**: The script uses default passwords for easy setup. For production:

- Change default passwords
- Configure firewall rules
- Enable SSL connections
- Set up regular backups 