#!/bin/bash

# Database seeding script for Clinic Appointment System
echo "Seeding database with test data..."

PGPASSWORD=postgres psql -U postgres -h localhost -d clinic_appointment_system -f src/scripts/seed-database.sql

if [ $? -eq 0 ]; then
    echo "✅ Database seeded successfully!"
    echo "You can now login with:"
    echo "  Email: admin@clinic.com"
    echo "  Password: password"
else
    echo "❌ Database seeding failed!"
    exit 1
fi 