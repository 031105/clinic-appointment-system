#!/bin/bash

# Database connection parameters
DB_USER="postgres"
DB_PASSWORD="postgres"  # Change this according to your database password
DB_NAME="clinic_appointment_system"
DB_HOST="localhost"
DB_PORT="5432"

# Path to the migration file
MIGRATION_FILE="./migrations/add_appointment_id_fk_to_medical_records.sql"

echo "Running migration: $MIGRATION_FILE"
echo "Connecting to database $DB_NAME as user $DB_USER..."

# Run the migration
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f $MIGRATION_FILE

# Check if the migration was successful
if [ $? -eq 0 ]; then
  echo "Migration completed successfully!"
else
  echo "Migration failed. Check the error messages above."
fi 