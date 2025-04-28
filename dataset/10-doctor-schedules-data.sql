-- Insert data into doctor_schedules table
INSERT INTO doctor_schedules (doctor_id, day_of_week, start_time, end_time, is_active, slot_duration) VALUES
-- Dr. John Smith (Cardiology)
(3, 1, '09:00:00', '12:00:00', TRUE, 30), -- Monday
(3, 1, '14:00:00', '17:00:00', TRUE, 30), -- Monday
(3, 3, '09:00:00', '12:00:00', TRUE, 30), -- Wednesday
(3, 5, '14:00:00', '17:00:00', TRUE, 30), -- Friday

-- Dr. Sarah Johnson (Pediatrics)
(4, 1, '09:00:00', '14:00:00', TRUE, 30), -- Monday
(4, 3, '09:00:00', '14:00:00', TRUE, 30), -- Wednesday
(4, 5, '09:00:00', '14:00:00', TRUE, 30), -- Friday

-- Dr. Michael Chen (Dermatology)
(5, 2, '10:00:00', '18:00:00', TRUE, 30), -- Tuesday
(5, 4, '10:00:00', '18:00:00', TRUE, 30), -- Thursday
(5, 5, '10:00:00', '16:00:00', TRUE, 30), -- Friday

-- Dr. Emily Rodriguez (Orthopedics)
(6, 1, '08:30:00', '16:30:00', TRUE, 30), -- Monday
(6, 3, '08:30:00', '16:30:00', TRUE, 30), -- Wednesday
(6, 5, '08:30:00', '14:30:00', TRUE, 30), -- Friday

-- Dr. David Nguyen (Neurology)
(7, 1, '09:00:00', '17:00:00', TRUE, 30), -- Monday
(7, 3, '09:00:00', '17:00:00', TRUE, 30), -- Wednesday
(7, 4, '09:00:00', '17:00:00', TRUE, 30), -- Thursday
(7, 5, '09:00:00', '15:00:00', TRUE, 30), -- Friday

-- Dr. Jennifer Patel (Ophthalmology)
(8, 1, '09:30:00', '17:30:00', TRUE, 30), -- Monday
(8, 3, '09:30:00', '17:30:00', TRUE, 30), -- Wednesday
(8, 5, '09:30:00', '15:30:00', TRUE, 30), -- Friday

-- Dr. Robert Kim (Dentistry)
(9, 1, '08:00:00', '16:00:00', TRUE, 30), -- Monday
(9, 3, '08:00:00', '16:00:00', TRUE, 30), -- Wednesday
(9, 5, '08:00:00', '14:00:00', TRUE, 30), -- Friday

-- Dr. Lisa Cohen (General Practice)
(10, 1, '08:30:00', '16:30:00', TRUE, 20), -- Monday
(10, 2, '08:30:00', '16:30:00', TRUE, 20), -- Tuesday
(10, 4, '08:30:00', '16:30:00', TRUE, 20), -- Thursday
(10, 5, '08:30:00', '14:30:00', TRUE, 20), -- Friday

-- Dr. James Carter (Obstetrics & Gynecology)
(11, 2, '09:00:00', '17:00:00', TRUE, 30), -- Tuesday
(11, 4, '09:00:00', '17:00:00', TRUE, 30), -- Thursday
(11, 5, '09:00:00', '15:00:00', TRUE, 30), -- Friday

-- Dr. Maria Garcia (Psychiatry)
(12, 2, '10:00:00', '18:00:00', TRUE, 60), -- Tuesday
(12, 4, '10:00:00', '18:00:00', TRUE, 60), -- Thursday
(12, 5, '10:00:00', '16:00:00', TRUE, 60), -- Friday

-- Dr. Daniel Wong (Urology)
(13, 1, '09:30:00', '17:30:00', TRUE, 30), -- Monday
(13, 3, '09:30:00', '17:30:00', TRUE, 30), -- Wednesday
(13, 5, '09:30:00', '15:30:00', TRUE, 30), -- Friday

-- Dr. Olivia Brown (Oncology)
(14, 1, '08:00:00', '16:00:00', TRUE, 30), -- Monday
(14, 3, '08:00:00', '16:00:00', TRUE, 30), -- Wednesday
(14, 5, '08:00:00', '14:00:00', TRUE, 30); -- Friday 