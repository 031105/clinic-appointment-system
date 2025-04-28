-- Insert data into reviews table
INSERT INTO reviews (patient_id, doctor_id, appointment_id, rating, comment, status, created_at, updated_at) VALUES
-- Reviews for Doctor 1 (Cardiology)
(15, 3, 1, 5.0, 'Dr. Johnson has been managing my hypertension for years. His approach is thorough and he takes time to explain everything clearly. Highly recommend!', 'approved', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(20, 3, 10, 4.0, 'Very knowledgeable cardiologist. The wait times can be long, but the quality of care is worth it.', 'approved', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(22, 3, 13, 5.0, 'Dr. Johnson helped me manage my blood pressure issues effectively. His advice on lifestyle changes has been invaluable.', 'approved', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(17, 3, 5, 4.0, 'Good doctor who takes time to listen. He adjusted my diabetes medication and it has made a big difference.', 'approved', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Reviews for Doctor 3 (Dermatology)
(18, 5, 7, 5.0, 'Dr. Williams transformed my skin! After struggling with dermatitis for years, his treatment plan has cleared my skin completely.', 'approved', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(23, 5, 14, 4.0, 'Very professional dermatologist. He diagnosed my eczema correctly when other doctors couldn't. Treatment is working well.', 'approved', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Reviews for Doctor 4 (Orthopedics)
(22, 6, 12, 5.0, 'Dr. Brown is an excellent rheumatologist. She diagnosed my rheumatoid arthritis quickly and started an effective treatment plan.', 'approved', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(17, 6, 6, 4.0, 'Helped with my knee pain significantly. Thorough examination and clear explanation of my condition.', 'approved', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Reviews for Doctor 5 (Neurology)
(16, 5, 3, 5.0, 'Dr. Miller is the best neurologist I've seen for my migraines. The medication she prescribed has reduced my attacks significantly.', 'approved', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Reviews for Doctor 8 (Ophthalmology)
(24, 8, 16, 4.0, 'Dr. Garcia helped me manage my GERD effectively. Appreciated his holistic approach to treatment.', 'approved', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(15, 8, 2, 5.0, 'Excellent allergy specialist. Dr. Garcia identified my food allergies that other doctors missed for years!', 'approved', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Reviews for Doctor 9 (Obstetrics & Gynecology)
(21, 11, 11, 5.0, 'Dr. Martinez is an amazing OB/GYN. She makes you feel comfortable and is very knowledgeable. Highly recommend!', 'approved', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(19, 11, 9, 4.0, 'Very professional and knowledgeable about hormone therapy. Makes you feel at ease during consultations.', 'approved', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Reviews for Doctor 10 (Psychiatry)
(19, 12, 8, 5.0, 'Dr. Robinson has been incredibly helpful with my anxiety disorder. His therapy approach combined with medication has changed my life.', 'approved', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(24, 12, 15, 5.0, 'Excellent psychiatrist. Dr. Robinson really listens and has helped me navigate through depression with both medication and therapeutic techniques.', 'approved', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP); 