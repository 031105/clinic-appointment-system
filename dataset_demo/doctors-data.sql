-- Insert data into doctors table
INSERT INTO doctors (user_id, department_id, specialization, years_of_experience, consultation_fee, rating, total_ratings, is_available) VALUES
-- Cardiology (Department ID: 1)
(2, 1, 'Interventional Cardiology', 15, 150.00, 4.8, 125, TRUE),
(6, 1, 'Cardiac Electrophysiology', 12, 160.00, 4.7, 98, TRUE),
(14, 1, 'Nuclear Cardiology', 10, 140.00, 4.5, 87, TRUE),
(17, 1, 'Heart Failure and Transplant Cardiology', 18, 170.00, 4.9, 142, TRUE),

-- Pediatrics (Department ID: 2)
(3, 2, 'Pediatric Immunology', 10, 120.00, 4.9, 98, TRUE),
(7, 2, 'Pediatric Neurology', 8, 125.00, 4.6, 76, TRUE),
(15, 2, 'Developmental Pediatrics', 14, 130.00, 4.7, 103, TRUE),

-- Dermatology (Department ID: 3)
(5, 3, 'Cosmetic Dermatology', 9, 140.00, 4.7, 112, TRUE),
(11, 3, 'Pediatric Dermatology', 12, 145.00, 4.8, 95, TRUE),
(19, 3, 'Dermatopathology', 7, 135.00, 4.5, 68, TRUE),

-- Orthopedics (Department ID: 4)
(8, 4, 'Sports Medicine', 15, 155.00, 4.8, 128, TRUE),
(13, 4, 'Joint Replacement Surgery', 17, 170.00, 4.9, 136, TRUE),
(20, 4, 'Spine Surgery', 14, 165.00, 4.7, 107, TRUE),

-- Neurology (Department ID: 5)
(9, 5, 'Movement Disorders', 13, 150.00, 4.6, 92, TRUE),
(16, 5, 'Epilepsy', 11, 145.00, 4.7, 85, TRUE),
(18, 5, 'Neuromuscular Medicine', 16, 155.00, 4.8, 114, TRUE),

-- Ophthalmology (Department ID: 6)
(10, 6, 'Glaucoma Specialist', 14, 160.00, 4.8, 117, TRUE),
(12, 6, 'Cornea and External Disease', 10, 150.00, 4.7, 89, TRUE),

-- Dentistry (Department ID: 7)
(4, 7, 'Dental Surgery', 8, 100.00, 4.7, 75, TRUE);