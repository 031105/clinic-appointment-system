#!/bin/bash

# Import script for clinic appointment system data
# This script will run database creation and import all the data in correct order

# Database connection parameters
DB_NAME="clinic_appointment_system"
DB_USER="postgres"  # Change this to your PostgreSQL username if different
DB_HOST="localhost"

echo "Creating database and schema..."
psql -U "$DB_USER" -h "$DB_HOST" -f /Users/gohshunda/Desktop/clinic-appointment-system-latest/database_creation_command.sql

echo "Importing data in sequence..."

# 1. First import roles and users data
echo "Importing roles and users data..."
psql -U "$DB_USER" -h "$DB_HOST" -d "$DB_NAME" -f /Users/gohshunda/Desktop/clinic-appointment-system-latest/dataset_fixed/01-roles-users-data.sql

# 2. Import departments and doctors data
echo "Importing departments and doctors data..."
psql -U "$DB_USER" -h "$DB_HOST" -d "$DB_NAME" -f /Users/gohshunda/Desktop/clinic-appointment-system-latest/dataset_fixed/02-departments-doctors-data.sql

# 3. Import patients data (including allergies and emergency contacts)
echo "Importing patients data..."
psql -U "$DB_USER" -h "$DB_HOST" -d "$DB_NAME" -f /Users/gohshunda/Desktop/clinic-appointment-system-latest/dataset_fixed/03-patients-data.sql

# 4. Import doctor schedules data
echo "Importing doctor schedules data..."
psql -U "$DB_USER" -h "$DB_HOST" -d "$DB_NAME" -f /Users/gohshunda/Desktop/clinic-appointment-system-latest/dataset_fixed/10-doctor-schedules-data.sql

# 5. Import appointments data
echo "Importing appointments data..."
psql -U "$DB_USER" -h "$DB_HOST" -d "$DB_NAME" -f /Users/gohshunda/Desktop/clinic-appointment-system-latest/dataset_fixed/04-appointments-data.sql

# 6. Import medical records and prescriptions data
echo "Importing medical records and prescriptions data..."
psql -U "$DB_USER" -h "$DB_HOST" -d "$DB_NAME" -f /Users/gohshunda/Desktop/clinic-appointment-system-latest/dataset_fixed/06-prescriptions-data.sql

# 7. Import reviews data
echo "Importing reviews data..."
psql -U "$DB_USER" -h "$DB_HOST" -d "$DB_NAME" -f /Users/gohshunda/Desktop/clinic-appointment-system-latest/dataset_fixed/05-reviews-data.sql

# 8. Import notifications data
echo "Importing notifications data..."
psql -U "$DB_USER" -h "$DB_HOST" -d "$DB_NAME" -f /Users/gohshunda/Desktop/clinic-appointment-system-latest/dataset_fixed/11-notifications-data.sql

echo "Data import completed successfully!" 