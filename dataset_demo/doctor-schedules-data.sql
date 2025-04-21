-- Insert data into doctor_schedules table
INSERT INTO doctor_schedules (doctor_id, day_of_week, start_time, end_time, is_available) VALUES
-- Dr. John Smith (Cardiology)
(1, 'monday', '09:00:00', '12:00:00', TRUE),
(1, 'monday', '14:00:00', '17:00:00', TRUE),
(1, 'wednesday', '09:00:00', '12:00:00', TRUE),
(1, 'friday', '14:00:00', '17:00:00', TRUE),

-- Dr. Robert Chen (Cardiology) 
(2, 'tuesday', '09:00:00', '12:00:00', TRUE),
(2, 'tuesday', '14:00:00', '17:00:00', TRUE),
(2, 'thursday', '09:00:00', '12:00:00', TRUE),
(2, 'thursday', '14:00:00', '17:00:00', TRUE),

-- Dr. James Wilson (Cardiology)
(3, 'monday', '13:00:00', '18:00:00', TRUE),
(3, 'wednesday', '13:00:00', '18:00:00', TRUE),
(3, 'friday', '08:00:00', '13:00:00', TRUE),

-- Dr. Kimberly Novak (Cardiology)
(4, 'tuesday', '08:00:00', '13:00:00', TRUE),
(4, 'thursday', '13:00:00', '18:00:00', TRUE),
(4, 'saturday', '09:00:00', '14:00:00', TRUE),

-- Dr. Sarah Johnson (Pediatrics)
(5, 'monday', '09:00:00', '14:00:00', TRUE),
(5, 'wednesday', '09:00:00', '14:00:00', TRUE),
(5, 'friday', '09:00:00', '14:00:00', TRUE),

-- Dr. Anna Lee (Pediatrics)
(6, 'tuesday', '09:00:00', '14:00:00', TRUE),
(6, 'thursday', '09:00:00', '14:00:00', TRUE),
(6, 'saturday', '09:00:00', '13:00:00', TRUE),

-- Dr. Natalie Clarke (Pediatrics)
(7, 'monday', '14:00:00', '19:00:00', TRUE),
(7, 'wednesday', '14:00:00', '19:00:00', TRUE),
(7, 'friday', '14:00:00', '19:00:00', TRUE),

-- Dr. Emily Wong (Dermatology)
(8, 'monday', '08:30:00', '12:30:00', TRUE),
(8, 'tuesday', '13:30:00', '17:30:00', TRUE),
(8, 'thursday', '08:30:00', '12:30:00', TRUE),

-- Dr. Lisa Mueller (Dermatology)
(9, 'monday', '13:30:00', '17:30:00', TRUE),
(9, 'wednesday', '08:30:00', '12:30:00', TRUE),
(9, 'friday', '13:30:00', '17:30:00', TRUE),

-- Dr. Abigail Wong (Dermatology)
(10, 'tuesday', '08:30:00', '17:30:00', TRUE),
(10, 'thursday', '13:30:00', '17:30:00', TRUE),
(10, 'saturday', '09:00:00', '13:00:00', TRUE),

-- Dr. William Tan (Orthopedics)
(11, 'monday', '08:00:00', '13:00:00', TRUE),
(11, 'wednesday', '08:00:00', '13:00:00', TRUE),
(11, 'friday', '08:00:00', '13:00:00', TRUE),

-- Dr. Maria Gonzalez (Orthopedics)
(12, 'tuesday', '08:00:00', '13:00:00', TRUE),
(12, 'thursday', '08:00:00', '13:00:00', TRUE),
(12, 'saturday', '08:00:00', '12:00:00', TRUE),

-- Dr. Ethan Patel (Orthopedics)
(13, 'monday', '14:00:00', '19:00:00', TRUE),
(13, 'wednesday', '14:00:00', '19:00:00', TRUE),
(13, 'friday', '14:00:00', '19:00:00', TRUE),

-- Dr. Sophia Kumar (Neurology)
(14, 'tuesday', '09:00:00', '16:00:00', TRUE),
(14, 'thursday', '09:00:00', '16:00:00', TRUE),
(14, 'friday', '09:00:00', '13:00:00', TRUE),

-- Dr. Kevin Park (Neurology)
(15, 'monday', '08:00:00', '15:00:00', TRUE),
(15, 'wednesday', '08:00:00', '15:00:00', TRUE),
(15, 'friday', '13:00:00', '18:00:00', TRUE),

-- Dr. Michael Ahmad (Neurology)
(16, 'tuesday', '13:00:00', '19:00:00', TRUE),
(16, 'thursday', '13:00:00', '19:00:00', TRUE),
(16, 'saturday', '09:00:00', '14:00:00', TRUE),

-- Dr. Ali Zhang (Ophthalmology)
(17, 'monday', '08:30:00', '15:30:00', TRUE),
(17, 'wednesday', '08:30:00', '15:30:00', TRUE),
(17, 'thursday', '13:30:00', '18:30:00', TRUE),

-- Dr. David Patel (Ophthalmology)
(18, 'tuesday', '08:30:00', '15:30:00', TRUE),
(18, 'thursday', '08:30:00', '12:30:00', TRUE),
(18, 'friday', '08:30:00', '15:30:00', TRUE),

-- Dr. Brandon Lee (Dentistry)
(19, 'monday', '09:00:00', '17:00:00', TRUE),
(19, 'wednesday', '09:00:00', '17:00:00', TRUE),
(19, 'friday', '09:00:00', '13:00:00', TRUE);