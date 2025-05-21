# Complete Database Documentation

This document contains the complete documentation of the clinic appointment system database.

Generated on: Fri May 16 08:07:05 +08 2025

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


## Enum Type: severity_level

### Values

| Value |
|-------|
| mild |
| moderate |
| severe |

### Used In Tables

| Table | Column |
|-------|--------|
| patient_allergies|severity |  |

---

## Enum Type: notification_type

### Values

| Value |
|-------|
| appointment |
| reminder |
| system |
| message |
| promotion |
| other |

### Used In Tables

| Table | Column |
|-------|--------|
| notifications|type |  |

---

## Enum Type: appointment_status

### Values

| Value |
|-------|
| scheduled |
| completed |
| cancelled |
| no_show |

### Used In Tables

| Table | Column |
|-------|--------|
| appointments|status |  |

---

## Enum Type: user_status

### Values

| Value |
|-------|
| active |
| inactive |
| suspended |

### Used In Tables

| Table | Column |
|-------|--------|
| users|status |  |

---

## Enum Type: record_type

### Values

| Value |
|-------|
| consultation |
| test |
| procedure |
| hospitalization |
| other |

### Used In Tables

| Table | Column |
|-------|--------|
| medical_records|record_type |  |

---

## Enum Type: review_status

### Values

| Value |
|-------|
| pending |
| approved |
| rejected |

### Used In Tables

| Table | Column |
|-------|--------|
| reviews|status |  |

---

## Table Schemas


## Table of Contents

- [Table: admins](#table-admins)
- [Table: appointments](#table-appointments)
- [Table: audit_logs](#table-audit_logs)
- [Table: consultations](#table-consultations)
- [Table: departments](#table-departments)
- [Table: doctor_leaves](#table-doctor_leaves)
- [Table: doctor_schedules](#table-doctor_schedules)
- [Table: doctor_unavailability](#table-doctor_unavailability)
- [Table: doctors](#table-doctors)
- [Table: emergency_contacts](#table-emergency_contacts)
- [Table: medical_record_attachments](#table-medical_record_attachments)
- [Table: medical_records](#table-medical_records)
- [Table: notification_preferences](#table-notification_preferences)
- [Table: notifications](#table-notifications)
- [Table: patient_allergies](#table-patient_allergies)
- [Table: patients](#table-patients)
- [Table: reviews](#table-reviews)
- [Table: roles](#table-roles)
- [Table: users](#table-users)

---

## Table: admins

### Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|

### Constraints and Indexes

```
```

### Foreign Keys

```
                               Table "public.admins"
-------------+--------------------------+-----------+----------+-------------------
 admin_id    | integer                  |           | not null | 
 admin_type  | character varying(50)    |           | not null | 
 permissions | jsonb                    |           |          | '{}'::jsonb
 created_at  | timestamp with time zone |           |          | CURRENT_TIMESTAMP
 updated_at  | timestamp with time zone |           |          | CURRENT_TIMESTAMP
Indexes:
    "admins_pkey" PRIMARY KEY, btree (admin_id)
Foreign-key constraints:
    "admins_admin_id_fkey" FOREIGN KEY (admin_id) REFERENCES users(user_id)
Triggers:
    update_admins_updated_at BEFORE UPDATE ON admins FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
```

### Referenced By

```
```

### Triggers

```
```

---

## Table: appointments

### Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|

### Constraints and Indexes

```
```

### Foreign Keys

```
```

### Referenced By

```
```

### Triggers

```
```

---

## Table: audit_logs

### Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|

### Constraints and Indexes

```
```

### Foreign Keys

```
                                         Table "public.audit_logs"
------------+--------------------------+-----------+----------+--------------------------------------------
 log_id     | integer                  |           | not null | nextval('audit_logs_log_id_seq'::regclass)
 user_id    | integer                  |           |          | 
 action     | character varying(50)    |           | not null | 
 table_name | character varying(50)    |           | not null | 
 record_id  | integer                  |           |          | 
 old_data   | jsonb                    |           |          | 
 new_data   | jsonb                    |           |          | 
 ip_address | inet                     |           |          | 
 user_agent | text                     |           |          | 
 created_at | timestamp with time zone |           |          | CURRENT_TIMESTAMP
Indexes:
    "audit_logs_pkey" PRIMARY KEY, btree (log_id)
    "idx_audit_logs_user" btree (user_id)
Foreign-key constraints:
    "audit_logs_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(user_id)
```

### Referenced By

```
```

### Triggers

```
```

---

## Table: consultations

### Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|

### Constraints and Indexes

```
```

### Foreign Keys

```
                                                 Table "public.consultations"
--------------------+--------------------------+-----------+----------+--------------------------------------------------------
 consultation_id    | integer                  |           | not null | nextval('consultations_consultation_id_seq'::regclass)
 appointment_id     | integer                  |           | not null | 
 diagnosis          | text                     |           | not null | 
 prescription       | text                     |           |          | 
 follow_up_required | boolean                  |           |          | false
 follow_up_date     | date                     |           |          | 
 created_at         | timestamp with time zone |           |          | CURRENT_TIMESTAMP
 updated_at         | timestamp with time zone |           |          | CURRENT_TIMESTAMP
Indexes:
    "consultations_pkey" PRIMARY KEY, btree (consultation_id)
Foreign-key constraints:
    "consultations_appointment_id_fkey" FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id)
Triggers:
    update_consultations_updated_at BEFORE UPDATE ON consultations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
```

### Referenced By

```
```

### Triggers

```
```

---

## Table: departments

### Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|

### Constraints and Indexes

```
                                              Table "public.departments"
----------------+--------------------------+-----------+----------+----------------------------------------------------
 department_id  | integer                  |           | not null | nextval('departments_department_id_seq'::regclass)
 name           | character varying(100)   |           | not null | 
 description    | text                     |           |          | 
 head_doctor_id | integer                  |           |          | 
 is_active      | boolean                  |           |          | true
 created_at     | timestamp with time zone |           |          | CURRENT_TIMESTAMP
 updated_at     | timestamp with time zone |           |          | CURRENT_TIMESTAMP
 emoji_icon     | character varying(100)   |           |          | '👨‍⚕️'::character varying
Indexes:
    "departments_pkey" PRIMARY KEY, btree (department_id)
    "departments_name_key" UNIQUE CONSTRAINT, btree (name)
Referenced by:
    TABLE "doctors" CONSTRAINT "doctors_department_id_fkey" FOREIGN KEY (department_id) REFERENCES departments(department_id)
Triggers:
    update_departments_updated_at BEFORE UPDATE ON departments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
```

### Foreign Keys

```
```

### Referenced By

```
```

### Triggers

```
```

---

## Table: doctor_leaves

### Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|

### Constraints and Indexes

```
```

### Foreign Keys

```
                                          Table "public.doctor_leaves"
------------+--------------------------+-----------+----------+-------------------------------------------------
 leave_id   | integer                  |           | not null | nextval('doctor_leaves_leave_id_seq'::regclass)
 doctor_id  | integer                  |           | not null | 
 start_date | date                     |           | not null | 
 end_date   | date                     |           | not null | 
 reason     | text                     |           |          | 
 created_at | timestamp with time zone |           |          | CURRENT_TIMESTAMP
 updated_at | timestamp with time zone |           |          | CURRENT_TIMESTAMP
Indexes:
    "doctor_leaves_pkey" PRIMARY KEY, btree (leave_id)
Foreign-key constraints:
    "doctor_leaves_doctor_id_fkey" FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id)
Triggers:
    update_doctor_leaves_updated_at BEFORE UPDATE ON doctor_leaves FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
```

### Referenced By

```
```

### Triggers

```
```

---

## Table: doctor_schedules

### Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|

### Constraints and Indexes

```
```

### Foreign Keys

```
                                             Table "public.doctor_schedules"
---------------+--------------------------+-----------+----------+-------------------------------------------------------
 schedule_id   | integer                  |           | not null | nextval('doctor_schedules_schedule_id_seq'::regclass)
 doctor_id     | integer                  |           | not null | 
 day_of_week   | integer                  |           | not null | 
 start_time    | time without time zone   |           | not null | 
 end_time      | time without time zone   |           | not null | 
 break_start   | time without time zone   |           |          | 
 break_end     | time without time zone   |           |          | 
 slot_duration | integer                  |           | not null | 30
 is_active     | boolean                  |           |          | true
 created_at    | timestamp with time zone |           |          | CURRENT_TIMESTAMP
 updated_at    | timestamp with time zone |           |          | CURRENT_TIMESTAMP
Indexes:
    "doctor_schedules_pkey" PRIMARY KEY, btree (schedule_id)
    "doctor_schedules_doctor_id_day_of_week_start_time_end_time_key" UNIQUE CONSTRAINT, btree (doctor_id, day_of_week, start_time, end_time)
Check constraints:
    "doctor_schedules_day_of_week_check" CHECK (day_of_week >= 0 AND day_of_week <= 6)
Foreign-key constraints:
    "doctor_schedules_doctor_id_fkey" FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id)
Triggers:
    update_doctor_schedules_updated_at BEFORE UPDATE ON doctor_schedules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
```

### Referenced By

```
```

### Triggers

```
```

---

## Table: doctor_unavailability

### Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|

### Constraints and Indexes

```
```

### Foreign Keys

```
                                                  Table "public.doctor_unavailability"
-------------------+--------------------------+-----------+----------+------------------------------------------------------------------
 unavailability_id | integer                  |           | not null | nextval('doctor_unavailability_unavailability_id_seq'::regclass)
 doctor_id         | integer                  |           | not null | 
 start_datetime    | timestamp with time zone |           | not null | 
 end_datetime      | timestamp with time zone |           | not null | 
 reason            | text                     |           |          | 
 created_at        | timestamp with time zone |           |          | CURRENT_TIMESTAMP
 updated_at        | timestamp with time zone |           |          | CURRENT_TIMESTAMP
Indexes:
    "doctor_unavailability_pkey" PRIMARY KEY, btree (unavailability_id)
Foreign-key constraints:
    "doctor_unavailability_doctor_id_fkey" FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id)
Triggers:
    update_doctor_unavailability_updated_at BEFORE UPDATE ON doctor_unavailability FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
```

### Referenced By

```
```

### Triggers

```
```

---

## Table: doctors

### Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|

### Constraints and Indexes

```
```

### Foreign Keys

```
```

### Referenced By

```
```

### Triggers

```
```

---

## Table: emergency_contacts

### Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|

### Constraints and Indexes

```
```

### Foreign Keys

```
                                            Table "public.emergency_contacts"
--------------+--------------------------+-----------+----------+--------------------------------------------------------
 contact_id   | integer                  |           | not null | nextval('emergency_contacts_contact_id_seq'::regclass)
 patient_id   | integer                  |           | not null | 
 name         | character varying(200)   |           | not null | 
 relationship | character varying(100)   |           | not null | 
 phone        | character varying(20)    |           | not null | 
 address      | jsonb                    |           |          | 
 is_default   | boolean                  |           |          | false
 created_at   | timestamp with time zone |           |          | CURRENT_TIMESTAMP
 updated_at   | timestamp with time zone |           |          | CURRENT_TIMESTAMP
Indexes:
    "emergency_contacts_pkey" PRIMARY KEY, btree (contact_id)
Foreign-key constraints:
    "emergency_contacts_patient_id_fkey" FOREIGN KEY (patient_id) REFERENCES patients(patient_id)
Triggers:
    update_emergency_contacts_updated_at BEFORE UPDATE ON emergency_contacts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
```

### Referenced By

```
```

### Triggers

```
```

---

## Table: medical_record_attachments

### Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|

### Constraints and Indexes

```
```

### Foreign Keys

```
                                              Table "public.medical_record_attachments"
---------------+--------------------------+-----------+----------+-------------------------------------------------------------------
 attachment_id | integer                  |           | not null | nextval('medical_record_attachments_attachment_id_seq'::regclass)
 record_id     | integer                  |           | not null | 
 file_name     | character varying(255)   |           | not null | 
 file_type     | character varying(100)   |           | not null | 
 file_size     | integer                  |           | not null | 
 file_url      | character varying(255)   |           | not null | 
 uploaded_at   | timestamp with time zone |           |          | CURRENT_TIMESTAMP
Indexes:
    "medical_record_attachments_pkey" PRIMARY KEY, btree (attachment_id)
Foreign-key constraints:
    "medical_record_attachments_record_id_fkey" FOREIGN KEY (record_id) REFERENCES medical_records(record_id)
```

### Referenced By

```
```

### Triggers

```
```

---

## Table: medical_records

### Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|

### Constraints and Indexes

```
```

### Foreign Keys

```
```

### Referenced By

```
```

### Triggers

```
```

---

## Table: notification_preferences

### Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|

### Constraints and Indexes

```
```

### Foreign Keys

```
                                               Table "public.notification_preferences"
-----------------+--------------------------+-----------+----------+-----------------------------------------------------------------
 preference_id   | integer                  |           | not null | nextval('notification_preferences_preference_id_seq'::regclass)
 user_id         | integer                  |           | not null | 
 email_enabled   | boolean                  |           |          | true
 sms_enabled     | boolean                  |           |          | true
 push_enabled    | boolean                  |           |          | true
 reminder_timing | integer                  |           | not null | 24
 preferences     | jsonb                    |           |          | '{}'::jsonb
 created_at      | timestamp with time zone |           |          | CURRENT_TIMESTAMP
 updated_at      | timestamp with time zone |           |          | CURRENT_TIMESTAMP
Indexes:
    "notification_preferences_pkey" PRIMARY KEY, btree (preference_id)
Foreign-key constraints:
    "notification_preferences_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(user_id)
Triggers:
    update_notification_preferences_updated_at BEFORE UPDATE ON notification_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
```

### Referenced By

```
```

### Triggers

```
```

---

## Table: notifications

### Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|

### Constraints and Indexes

```
```

### Foreign Keys

```
                                                Table "public.notifications"
-----------------+--------------------------+-----------+----------+--------------------------------------------------------
 notification_id | integer                  |           | not null | nextval('notifications_notification_id_seq'::regclass)
 user_id         | integer                  |           | not null | 
 title           | character varying(255)   |           | not null | 
 message         | text                     |           | not null | 
 type            | notification_type        |           | not null | 
 data            | jsonb                    |           |          | '{}'::jsonb
 is_read         | boolean                  |           |          | false
 read_at         | timestamp with time zone |           |          | 
 created_at      | timestamp with time zone |           |          | CURRENT_TIMESTAMP
Indexes:
    "notifications_pkey" PRIMARY KEY, btree (notification_id)
    "idx_notifications_user_read" btree (user_id, is_read)
Foreign-key constraints:
    "notifications_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(user_id)
```

### Referenced By

```
```

### Triggers

```
```

---

## Table: patient_allergies

### Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|

### Constraints and Indexes

```
```

### Foreign Keys

```
                                           Table "public.patient_allergies"
------------+--------------------------+-----------+----------+-------------------------------------------------------
 allergy_id | integer                  |           | not null | nextval('patient_allergies_allergy_id_seq'::regclass)
 patient_id | integer                  |           | not null | 
 name       | character varying(100)   |           | not null | 
 severity   | severity_level           |           | not null | 
 reaction   | text                     |           |          | 
 notes      | text                     |           |          | 
 created_at | timestamp with time zone |           |          | CURRENT_TIMESTAMP
 updated_at | timestamp with time zone |           |          | CURRENT_TIMESTAMP
Indexes:
    "patient_allergies_pkey" PRIMARY KEY, btree (allergy_id)
Foreign-key constraints:
    "patient_allergies_patient_id_fkey" FOREIGN KEY (patient_id) REFERENCES patients(patient_id)
Triggers:
    update_patient_allergies_updated_at BEFORE UPDATE ON patient_allergies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
```

### Referenced By

```
```

### Triggers

```
```

---

## Table: patients

### Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|

### Constraints and Indexes

```
```

### Foreign Keys

```
```

### Referenced By

```
```

### Triggers

```
```

---

## Table: reviews

### Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|

### Constraints and Indexes

```
```

### Foreign Keys

```
                                             Table "public.reviews"
------------------+--------------------------+-----------+----------+--------------------------------------------
 review_id        | integer                  |           | not null | nextval('reviews_review_id_seq'::regclass)
 patient_id       | integer                  |           | not null | 
 doctor_id        | integer                  |           | not null | 
 appointment_id   | integer                  |           |          | 
 rating           | numeric(2,1)             |           | not null | 
 comment          | text                     |           |          | 
 anonymous        | boolean                  |           |          | false
 status           | review_status            |           | not null | 'pending'::review_status
 rejection_reason | text                     |           |          | 
 created_at       | timestamp with time zone |           |          | CURRENT_TIMESTAMP
 updated_at       | timestamp with time zone |           |          | CURRENT_TIMESTAMP
Indexes:
    "reviews_pkey" PRIMARY KEY, btree (review_id)
Check constraints:
    "reviews_rating_check" CHECK (rating >= 1::numeric AND rating <= 5::numeric)
Foreign-key constraints:
    "reviews_appointment_id_fkey" FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id)
    "reviews_doctor_id_fkey" FOREIGN KEY (doctor_id) REFERENCES doctors(doctor_id)
    "reviews_patient_id_fkey" FOREIGN KEY (patient_id) REFERENCES patients(patient_id)
Triggers:
    update_doctor_rating_on_review_delete AFTER DELETE ON reviews FOR EACH ROW EXECUTE FUNCTION update_doctor_rating()
    update_doctor_rating_on_review_insert AFTER INSERT ON reviews FOR EACH ROW EXECUTE FUNCTION update_doctor_rating()
    update_doctor_rating_on_review_update AFTER UPDATE ON reviews FOR EACH ROW WHEN (old.rating <> new.rating OR old.status <> new.status) EXECUTE FUNCTION update_doctor_rating()
    update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
```

### Referenced By

```
```

### Triggers

```
```

---

## Table: roles

### Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|

### Constraints and Indexes

```
                                          Table "public.roles"
-------------+--------------------------+-----------+----------+----------------------------------------
 role_id     | integer                  |           | not null | nextval('roles_role_id_seq'::regclass)
 role_name   | character varying(50)    |           | not null | 
 description | text                     |           |          | 
 permissions | jsonb                    |           |          | '{}'::jsonb
 created_at  | timestamp with time zone |           |          | CURRENT_TIMESTAMP
 updated_at  | timestamp with time zone |           |          | CURRENT_TIMESTAMP
Indexes:
    "roles_pkey" PRIMARY KEY, btree (role_id)
    "roles_role_name_key" UNIQUE CONSTRAINT, btree (role_name)
Referenced by:
    TABLE "users" CONSTRAINT "users_role_id_fkey" FOREIGN KEY (role_id) REFERENCES roles(role_id)
Triggers:
    update_roles_updated_at BEFORE UPDATE ON roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
```

### Foreign Keys

```
```

### Referenced By

```
```

### Triggers

```
```

---

## Table: users

### Columns

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|

### Constraints and Indexes

```
```

### Foreign Keys

```
```

### Referenced By

```
```

### Triggers

```
```

---

