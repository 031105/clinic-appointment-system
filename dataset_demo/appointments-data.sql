-- Insert data into appointments table
INSERT INTO appointments (patient_id, doctor_id, schedule_id, appointment_date, start_time, end_time, status, notes, created_at) VALUES
(5, 1, 1, '2025-06-16', '09:30:00', '10:00:00', 'confirmed', 'Regular checkup for heart condition', CURRENT_TIMESTAMP),
(6, 1, 3, '2025-06-18', '10:15:00', '10:45:00', 'confirmed', 'Follow-up appointment after medication change', CURRENT_TIMESTAMP),
(7, 2, 5, '2025-06-17', '11:00:00', '11:30:00', 'pending', 'Vaccination and general checkup', CURRENT_TIMESTAMP),
(8, 3, 9, '2025-06-16', '09:45:00', '10:15:00', 'confirmed', 'Dental cleaning and checkup', CURRENT_TIMESTAMP),
(9, 2, 7, '2025-06-19', '10:30:00', '11:00:00', 'confirmed', 'Seasonal allergy consultation', CURRENT_TIMESTAMP),
(5, 3, 10, '2025-06-18', '15:00:00', '15:30:00', 'pending', 'Wisdom tooth evaluation', CURRENT_TIMESTAMP),
(6, 2, 8, '2025-06-19', '16:00:00', '16:30:00', 'cancelled', 'Regular pediatric checkup - cancelled due to travel', CURRENT_TIMESTAMP),
(7, 1, 4, '2025-06-20', '15:45:00', '16:15:00', 'confirmed', 'Blood pressure monitoring', CURRENT_TIMESTAMP);
