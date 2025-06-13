-- Seed data for Clinic Appointment System
-- This will populate the database with test data

-- Insert roles
INSERT INTO roles (role_name, description) VALUES
('admin', 'System administrator with full access'),
('doctor', 'Medical practitioner'),
('patient', 'Patient receiving medical care')
ON CONFLICT (role_name) DO NOTHING;

-- Get role IDs for reference
DO $$
DECLARE
    admin_role_id INTEGER;
    doctor_role_id INTEGER;
    patient_role_id INTEGER;
BEGIN
    SELECT role_id INTO admin_role_id FROM roles WHERE role_name = 'admin';
    SELECT role_id INTO doctor_role_id FROM roles WHERE role_name = 'doctor';
    SELECT role_id INTO patient_role_id FROM roles WHERE role_name = 'patient';

    -- Insert departments
    INSERT INTO departments (name, description) VALUES
    ('Cardiology', 'Heart and cardiovascular diseases'),
    ('Neurology', 'Brain and nervous system disorders'),
    ('Orthopedics', 'Bone and joint problems'),
    ('Pediatrics', 'Children healthcare'),
    ('Dermatology', 'Skin conditions and diseases'),
    ('Internal Medicine', 'General internal medicine'),
    ('Emergency Medicine', 'Emergency and urgent care')
    ON CONFLICT (name) DO NOTHING;

    -- Insert admin users
    INSERT INTO users (email, password_hash, first_name, last_name, role_id, status, email_verified) VALUES
    ('admin@clinic.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin', 'User', admin_role_id, 'active', true),
    ('admin2@clinic.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Sarah', 'Administrator', admin_role_id, 'active', true)
    ON CONFLICT (email) DO NOTHING;

    -- Insert doctor users
    INSERT INTO users (email, password_hash, first_name, last_name, phone, role_id, status, email_verified) VALUES
    ('dr.smith@clinic.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'John', 'Smith', '+1234567890', doctor_role_id, 'active', true),
    ('dr.johnson@clinic.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Sarah', 'Johnson', '+1234567891', doctor_role_id, 'active', true),
    ('dr.chen@clinic.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Michael', 'Chen', '+1234567892', doctor_role_id, 'active', true),
    ('dr.brown@clinic.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Emily', 'Brown', '+1234567893', doctor_role_id, 'active', true),
    ('dr.wilson@clinic.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Robert', 'Wilson', '+1234567894', doctor_role_id, 'active', true)
    ON CONFLICT (email) DO NOTHING;

    -- Insert patient users
    INSERT INTO users (email, password_hash, first_name, last_name, phone, role_id, status, email_verified) VALUES
    ('patient1@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Alice', 'Cooper', '+1234567895', patient_role_id, 'active', true),
    ('patient2@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Bob', 'Wilson', '+1234567896', patient_role_id, 'active', true),
    ('patient3@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Charlie', 'Davis', '+1234567897', patient_role_id, 'active', true),
    ('patient4@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Diana', 'Miller', '+1234567898', patient_role_id, 'active', true),
    ('patient5@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Eve', 'Taylor', '+1234567899', patient_role_id, 'active', true)
    ON CONFLICT (email) DO NOTHING;

    -- Insert doctor profiles
    INSERT INTO doctors (doctor_id, department_id, specialty, license_number, qualification, experience, consultation_fee) 
    SELECT 
        u.user_id,
        d.department_id,
        d.name,
        CASE 
            WHEN u.first_name = 'John' THEN 'MD12345'
            WHEN u.first_name = 'Sarah' THEN 'MD12346'
            WHEN u.first_name = 'Michael' THEN 'MD12347'
            WHEN u.first_name = 'Emily' THEN 'MD12348'
            WHEN u.first_name = 'Robert' THEN 'MD12349'
        END,
        CASE 
            WHEN u.first_name = 'John' THEN 'MD, FACC - Board Certified Cardiologist'
            WHEN u.first_name = 'Sarah' THEN 'MD, PhD - Neurologist Specialist'
            WHEN u.first_name = 'Michael' THEN 'MD, FAAOS - Orthopedic Surgeon'
            WHEN u.first_name = 'Emily' THEN 'MD, FAAP - Pediatric Specialist'
            WHEN u.first_name = 'Robert' THEN 'MD, FACP - Internal Medicine'
        END,
        CASE 
            WHEN u.first_name = 'John' THEN 10
            WHEN u.first_name = 'Sarah' THEN 8
            WHEN u.first_name = 'Michael' THEN 12
            WHEN u.first_name = 'Emily' THEN 6
            WHEN u.first_name = 'Robert' THEN 15
        END,
        CASE 
            WHEN u.first_name = 'John' THEN 150.00
            WHEN u.first_name = 'Sarah' THEN 120.00
            WHEN u.first_name = 'Michael' THEN 180.00
            WHEN u.first_name = 'Emily' THEN 100.00
            WHEN u.first_name = 'Robert' THEN 200.00
        END
    FROM users u
    JOIN departments d ON (
        (u.first_name = 'John' AND d.name = 'Cardiology') OR
        (u.first_name = 'Sarah' AND d.name = 'Neurology') OR
        (u.first_name = 'Michael' AND d.name = 'Orthopedics') OR
        (u.first_name = 'Emily' AND d.name = 'Pediatrics') OR
        (u.first_name = 'Robert' AND d.name = 'Internal Medicine')
    )
    WHERE u.role_id = doctor_role_id
    ON CONFLICT (doctor_id) DO NOTHING;

    -- Insert patient profiles
    INSERT INTO patients (patient_id, date_of_birth, gender, blood_type, height, weight)
    SELECT 
        u.user_id,
        CASE 
            WHEN u.first_name = 'Alice' THEN '1990-05-15'::date
            WHEN u.first_name = 'Bob' THEN '1985-08-22'::date
            WHEN u.first_name = 'Charlie' THEN '1975-12-03'::date
            WHEN u.first_name = 'Diana' THEN '1988-03-10'::date
            WHEN u.first_name = 'Eve' THEN '1992-11-28'::date
        END,
        CASE 
            WHEN u.first_name IN ('Alice', 'Diana', 'Eve') THEN 'female'
            ELSE 'male'
        END,
        CASE 
            WHEN u.first_name = 'Alice' THEN 'A+'
            WHEN u.first_name = 'Bob' THEN 'O+'
            WHEN u.first_name = 'Charlie' THEN 'B+'
            WHEN u.first_name = 'Diana' THEN 'AB+'
            WHEN u.first_name = 'Eve' THEN 'A-'
        END,
        CASE 
            WHEN u.first_name IN ('Alice', 'Diana', 'Eve') THEN 165
            ELSE 175
        END,
        CASE 
            WHEN u.first_name = 'Alice' THEN 60
            WHEN u.first_name = 'Bob' THEN 75
            WHEN u.first_name = 'Charlie' THEN 80
            WHEN u.first_name = 'Diana' THEN 55
            WHEN u.first_name = 'Eve' THEN 58
        END
    FROM users u
    WHERE u.role_id = patient_role_id
    ON CONFLICT (patient_id) DO NOTHING;

    -- Insert appointments
    INSERT INTO appointments (patient_id, doctor_id, appointment_datetime, end_datetime, type, status, notes)
    SELECT 
        p.user_id as patient_id,
        d.user_id as doctor_id,
        NOW() - INTERVAL '1 day' + (random() * INTERVAL '30 days'),
        NOW() - INTERVAL '1 day' + (random() * INTERVAL '30 days') + INTERVAL '30 minutes',
        (ARRAY['checkup', 'followup', 'consultation'])[floor(random() * 3 + 1)],
        (ARRAY['completed', 'scheduled', 'cancelled'])[floor(random() * 3 + 1)]::appointment_status,
        'Regular appointment'
    FROM users p
    CROSS JOIN users d
    WHERE p.role_id = patient_role_id 
    AND d.role_id = doctor_role_id
    LIMIT 20
    ON CONFLICT DO NOTHING;

    -- Insert medical records
    INSERT INTO medical_records (patient_id, doctor_id, appointment_id, record_type, title, description, date_of_record, diagnosis, prescription, notes)
    SELECT 
        a.patient_id,
        a.doctor_id,
        a.appointment_id,
        'consultation'::record_type,
        CASE 
            WHEN random() < 0.3 THEN 'Hypertension Treatment'
            WHEN random() < 0.5 THEN 'Cold and Flu Care'
            WHEN random() < 0.7 THEN 'Diabetes Management'
            WHEN random() < 0.8 THEN 'Migraine Treatment'
            ELSE 'General Health Checkup'
        END,
        CASE 
            WHEN random() < 0.3 THEN 'Patient presents with elevated blood pressure. Recommended lifestyle changes and medication.'
            WHEN random() < 0.5 THEN 'Patient shows symptoms of common cold including fever, cough, and congestion.'
            WHEN random() < 0.7 THEN 'Blood sugar levels are elevated. Discussed diet and exercise modifications.'
            WHEN random() < 0.8 THEN 'Patient experiencing severe headaches with light sensitivity.'
            ELSE 'Routine health examination. All vitals within normal range.'
        END,
        CURRENT_DATE,
        CASE 
            WHEN random() < 0.3 THEN 'Hypertension'
            WHEN random() < 0.5 THEN 'Common cold'
            WHEN random() < 0.7 THEN 'Diabetes type 2'
            WHEN random() < 0.8 THEN 'Migraine'
            ELSE 'General checkup - healthy'
        END,
        CASE 
            WHEN random() < 0.8 THEN ARRAY['Acetaminophen 500mg - Twice daily for 7 days', 'Rest and plenty of fluids']
            ELSE ARRAY[]::text[]
        END,
        CASE 
            WHEN random() < 0.3 THEN 'Patient reported chest pain, ECG normal'
            WHEN random() < 0.5 THEN 'Symptoms include fever and cough'
            WHEN random() < 0.7 THEN 'Blood sugar levels elevated, diet counseling provided'
            WHEN random() < 0.8 THEN 'Severe headache, light sensitivity noted'
            ELSE 'Routine checkup, all vitals normal'
        END
    FROM appointments a
    WHERE a.status = 'completed'
    ON CONFLICT DO NOTHING;

    -- Insert some additional completed appointments for more medical records
    UPDATE appointments 
    SET status = 'completed' 
    WHERE appointment_id IN (
        SELECT appointment_id FROM appointments 
        WHERE status != 'completed' 
        LIMIT 10
    );

END $$; 