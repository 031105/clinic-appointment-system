-- Insert data into departments table
INSERT INTO departments (name, description, is_active) VALUES
('Cardiology', 'Diagnosis and treatment of heart-related conditions', TRUE),
('Pediatrics', 'Medical care for infants, children, and adolescents', TRUE),
('Dermatology', 'Diagnosis and treatment of skin conditions', TRUE),
('Orthopedics', 'Treatment of the musculoskeletal system', TRUE),
('Neurology', 'Diagnosis and treatment of nervous system disorders', TRUE),
('Ophthalmology', 'Medical and surgical care of the eyes', TRUE),
('Dentistry', 'Diagnosis, prevention, and treatment of oral diseases', TRUE),
('General Practice', 'Primary care for all patients', TRUE),
('Obstetrics & Gynecology', 'Women's health and pregnancy care', TRUE),
('Psychiatry', 'Mental health diagnosis and treatment', TRUE),
('Urology', 'Diagnosis and treatment of urinary tract disorders', TRUE),
('Oncology', 'Diagnosis and treatment of cancer', TRUE);

-- Insert data into doctors table
INSERT INTO doctors (doctor_id, department_id, specialty, license_number, qualification, experience, bio, consultation_fee, average_rating, total_reviews, created_at, updated_at) VALUES
-- Cardiology (department_id: 1)
(3, 1, 'Interventional Cardiology', 'CD12345', 'MD, FACC', 15, 'Dr. Smith specializes in cardiac interventions with 15 years of experience in complex cardiac procedures.', 250.00, 4.8, 158, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
-- Pediatrics (department_id: 2)
(4, 2, 'General Pediatrics', 'PD67890', 'MD, FAAP', 12, 'Dr. Johnson is a compassionate pediatrician with special interest in child development and preventive care.', 180.00, 4.9, 203, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
-- Dermatology (department_id: 3)
(5, 3, 'Cosmetic Dermatology', 'DM54321', 'MD, FAAD', 10, 'Dr. Chen specializes in cosmetic dermatology and treatment of complex skin conditions.', 200.00, 4.7, 175, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
-- Orthopedics (department_id: 4)
(6, 4, 'Sports Medicine', 'OR98765', 'MD, FAAOS', 14, 'Dr. Rodriguez focuses on sports injuries and joint replacements with extensive experience in arthroscopic surgery.', 230.00, 4.6, 142, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
-- Neurology (department_id: 5)
(7, 5, 'Neurophysiology', 'NR24680', 'MD, PhD', 17, 'Dr. Nguyen is a neurologist specializing in neurophysiology and treatment of complex neurological disorders.', 270.00, 4.9, 189, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
-- Ophthalmology (department_id: 6)
(8, 6, 'Retina Specialist', 'OP13579', 'MD, FACS', 13, 'Dr. Patel specializes in retinal diseases and surgeries with expertise in the latest treatment modalities.', 240.00, 4.8, 163, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
-- Dentistry (department_id: 7)
(9, 7, 'Orthodontics', 'DT86420', 'DDS, MS', 9, 'Dr. Kim specializes in orthodontic treatment with focus on minimally invasive techniques.', 190.00, 4.7, 152, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
-- General Practice (department_id: 8)
(10, 8, 'Family Medicine', 'GP75319', 'MD, FAAFP', 11, 'Dr. Cohen provides comprehensive family medicine care with emphasis on preventive health.', 150.00, 4.9, 227, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
-- Obstetrics & Gynecology (department_id: 9)
(11, 9, 'Reproductive Endocrinology', 'OG46802', 'MD, FACOG', 16, 'Dr. Carter specializes in reproductive endocrinology with expertise in fertility treatments.', 260.00, 4.8, 178, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
-- Psychiatry (department_id: 10)
(12, 10, 'Child & Adolescent Psychiatry', 'PS58273', 'MD, DFAPA', 15, 'Dr. Garcia specializes in child and adolescent psychiatry with focus on developmental disorders.', 220.00, 4.7, 146, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
-- Urology (department_id: 11)
(13, 11, 'Urologic Oncology', 'UR92847', 'MD, FACS', 18, 'Dr. Wong specializes in urologic oncology with extensive experience in minimally invasive procedures.', 250.00, 4.9, 167, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
-- Oncology (department_id: 12)
(14, 12, 'Medical Oncology', 'ON36925', 'MD, PhD', 20, 'Dr. Brown specializes in medical oncology with focus on personalized cancer treatment.', 280.00, 4.8, 198, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP); 