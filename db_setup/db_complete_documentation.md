# Complete Database Documentation

This document contains the complete documentation of the clinic appointment system database.

Generated on: `date +"%Y-%m-%d %H:%M:%S %Z"`

## Database Entity Relationship

The following tables and their relationships form the database schema:

```
users <-- roles
users --> patients
users --> doctors
users --> admins
doctors <-- departments
patients --> emergency_contacts
patients --> patient_allergies
doctors --> doctor_schedules
doctors --> doctor_leaves
doctors --> doctor_unavailability
patients --> appointments <-- doctors
appointments --> medical_records
medical_records --> medical_record_attachments
users --> notifications
users --> notification_preferences
patients --> reviews --> doctors
appointments --> consultations
users --> audit_logs
```

## Table of Contents

1. [Database Entity Relationship](#database-entity-relationship)
2. [Database Enum Types](#database-enum-types)
3. [Table Schemas](#table-schemas)

## Database Enum Types

### Enum Type: severity_level
- mild
- moderate
- severe

### Enum Type: notification_type
- appointment
- reminder
- system
- message
- promotion
- other

### Enum Type: appointment_status
- scheduled
- completed
- cancelled
- no_show

### Enum Type: user_status
- active
- inactive
- suspended

### Enum Type: record_type
- consultation
- test
- procedure
- hospitalization
- other

### Enum Type: review_status
- pending
- approved
- rejected

## Table Schemas

### Table: users
- user_id (PK)
- role_id (FK -> roles.role_id)
- email (unique)
- password_hash
- first_name
- last_name
- phone
- address
- profile_image
- status (user_status)
- created_at
- updated_at

### Table: roles
- role_id (PK)
- role_name (unique)
- description
- permissions (jsonb)
- created_at
- updated_at

### Table: patients
- patient_id (PK, FK -> users.user_id)
- blood_type
- medical_history
- date_of_birth
- gender
- height
- weight
- created_at
- updated_at

### Table: doctors
- doctor_id (PK, FK -> users.user_id)
- department_id (FK -> departments.department_id)
- specialization
- qualifications
- experience_years
- consultation_fee
- rating
- bio
- created_at
- updated_at

### Table: departments
- department_id (PK)
- name (unique)
- description
- head_doctor_id
- is_active
- emoji_icon
- created_at
- updated_at

### Table: appointments
- appointment_id (PK)
- patient_id (FK -> patients.patient_id)
- doctor_id (FK -> doctors.doctor_id)
- appointment_datetime
- end_datetime
- type
- status (appointment_status)
- notes
- created_at
- updated_at

### Table: medical_records
- record_id (PK)
- patient_id (FK -> patients.patient_id)
- doctor_id (FK -> doctors.doctor_id)
- appointment_id (FK -> appointments.appointment_id)
- record_type (record_type)
- description
- diagnosis
- prescription
- notes
- created_at
- updated_at

### Table: emergency_contacts
- contact_id (PK)
- patient_id (FK -> patients.patient_id)
- name
- relationship
- phone
- address (jsonb)
- is_default
- created_at
- updated_at

### Table: patient_allergies
- allergy_id (PK)
- patient_id (FK -> patients.patient_id)
- name
- severity (severity_level)
- reaction
- notes
- created_at
- updated_at

### Table: notifications
- notification_id (PK)
- user_id (FK -> users.user_id)
- title
- message
- type (notification_type)
- data (jsonb)
- is_read
- read_at
- created_at

### Table: reviews
- review_id (PK)
- patient_id (FK -> patients.patient_id)
- doctor_id (FK -> doctors.doctor_id)
- appointment_id (FK -> appointments.appointment_id)
- rating (numeric(2,1))
- comment
- anonymous
- status (review_status)
- rejection_reason
- created_at
- updated_at

## Special Notes

1. The `medical_records` table has a foreign key relationship with `appointments` table, and when a medical record is created, it automatically updates the appointment status to 'COMPLETED'.

2. The `notification_preferences` table has been updated to have more specific notification settings (email_appointment, email_reminders, in_app_notifications) instead of general settings.

3. All tables with timestamps have automatic update triggers for `updated_at` column.

4. The `reviews` table has triggers to automatically update doctor ratings when reviews are added, updated, or deleted.

5. The `appointments` table is central to the system and has relationships with patients, doctors, medical records, and consultations.
