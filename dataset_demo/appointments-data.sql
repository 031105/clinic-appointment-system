-- Insert data into appointments table
INSERT INTO appointments (patient_id, doctor_id, schedule_id, appointment_date, start_time, end_time, status, notes, created_at) VALUES
-- Cardiology Appointments
(21, 1, 1, '2025-06-16', '09:30:00', '10:00:00', 'confirmed', 'Regular checkup for heart condition', CURRENT_TIMESTAMP),
(22, 1, 3, '2025-06-18', '10:15:00', '10:45:00', 'confirmed', 'Follow-up appointment after medication change', CURRENT_TIMESTAMP),
(23, 2, 5, '2025-06-17', '10:30:00', '11:00:00', 'pending', 'Initial consultation for chest pain', CURRENT_TIMESTAMP),
(24, 3, 9, '2025-06-19', '15:00:00', '15:30:00', 'confirmed', 'Regular cardiology checkup', CURRENT_TIMESTAMP),
(25, 4, 12, '2025-06-20', '09:30:00', '10:00:00', 'confirmed', 'Heart monitoring appointment', CURRENT_TIMESTAMP),

-- Pediatrics Appointments
(21, 5, 15, '2025-06-16', '11:00:00', '11:30:00', 'confirmed', 'Child vaccination appointment', CURRENT_TIMESTAMP),
(22, 6, 18, '2025-06-17', '10:00:00', '10:30:00', 'pending', 'Routine pediatric checkup', CURRENT_TIMESTAMP),
(23, 7, 21, '2025-06-18', '16:00:00', '16:30:00', 'confirmed', 'Follow-up for previous treatment', CURRENT_TIMESTAMP),

-- Dermatology Appointments
(24, 8, 25, '2025-06-17', '10:30:00', '11:00:00', 'confirmed', 'Skin condition assessment', CURRENT_TIMESTAMP),
(25, 9, 29, '2025-06-18', '09:30:00', '10:00:00', 'confirmed', 'Acne treatment follow-up', CURRENT_TIMESTAMP),
(21, 10, 32, '2025-06-20', '10:30:00', '11:00:00', 'pending', 'Consultation for rash', CURRENT_TIMESTAMP),

-- Orthopedics Appointments
(22, 11, 37, '2025-06-16', '09:30:00', '10:00:00', 'confirmed', 'Joint pain assessment', CURRENT_TIMESTAMP),
(23, 12, 40, '2025-06-18', '10:30:00', '11:00:00', 'confirmed', 'Post-surgery follow-up', CURRENT_TIMESTAMP),
(24, 13, 43, '2025-06-19', '16:00:00', '16:30:00', 'pending', 'Back pain consultation', CURRENT_TIMESTAMP),

-- Neurology Appointments
(25, 14, 47, '2025-06-19', '10:30:00', '11:00:00', 'confirmed', 'Headache assessment', CURRENT_TIMESTAMP),
(21, 15, 51, '2025-06-18', '09:30:00', '10:00:00', 'confirmed', 'Migraine follow-up', CURRENT_TIMESTAMP),
(22, 16, 55, '2025-06-22', '14:30:00', '15:00:00', 'pending', 'Neurological consultation', CURRENT_TIMESTAMP),

-- Ophthalmology Appointments
(23, 17, 58, '2025-06-17', '10:30:00', '11:00:00', 'confirmed', 'Regular eye checkup', CURRENT_TIMESTAMP),
(24, 18, 61, '2025-06-19', '09:30:00', '10:00:00', 'confirmed', 'Vision assessment', CURRENT_TIMESTAMP),

-- Dentistry Appointments
(25, 19, 64, '2025-06-18', '15:00:00', '15:30:00', 'confirmed', 'Dental cleaning', CURRENT_TIMESTAMP),
(21, 19, 65, '2025-06-20', '11:00:00', '11:30:00', 'pending', 'Cavity treatment', CURRENT_TIMESTAMP);