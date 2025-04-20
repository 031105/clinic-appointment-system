-- Insert data into reviews table
INSERT INTO reviews (patient_id, doctor_id, appointment_id, rating, comment, created_at) VALUES
(5, 1, 1, 5, 'Dr. Smith was very thorough and took the time to explain my condition and treatment options. Highly recommend!', CURRENT_TIMESTAMP),
(6, 1, 2, 5, 'Excellent doctor. Very knowledgeable and caring. Answered all my questions patiently.', CURRENT_TIMESTAMP),
(8, 3, 4, 4, 'Dr. Brandon was professional and gentle during my dental procedure. The waiting time was a bit long though.', CURRENT_TIMESTAMP),
(9, 2, 5, 5, 'Dr. Johnson is amazing with children. My son was nervous but she made him feel comfortable.', CURRENT_TIMESTAMP),
(7, 1, 8, 5, 'Great experience. Dr. Smith is always professional and explains everything clearly.', CURRENT_TIMESTAMP);
