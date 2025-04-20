-- Insert data into doctor_schedules table
INSERT INTO doctor_schedules (doctor_id, day_of_week, start_time, end_time, is_available) VALUES
(1, 'monday', '09:00:00', '12:00:00', TRUE),
(1, 'monday', '14:00:00', '17:00:00', TRUE),
(1, 'wednesday', '09:00:00', '12:00:00', TRUE),
(1, 'friday', '14:00:00', '17:00:00', TRUE),
(2, 'tuesday', '09:00:00', '12:00:00', TRUE),
(2, 'tuesday', '14:00:00', '17:00:00', TRUE),
(2, 'thursday', '09:00:00', '12:00:00', TRUE),
(2, 'thursday', '14:00:00', '17:00:00', TRUE),
(3, 'monday', '09:00:00', '12:00:00', TRUE),
(3, 'wednesday', '14:00:00', '17:00:00', TRUE),
(3, 'friday', '09:00:00', '12:00:00', TRUE);
