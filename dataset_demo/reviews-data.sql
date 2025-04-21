-- Insert data into reviews table
INSERT INTO reviews (patient_id, doctor_id, appointment_id, rating, comment, created_at) VALUES
-- Cardiology Reviews
(21, 1, 1, 5, 'Dr. Smith was very thorough and took the time to explain my condition and treatment options. His approach was both professional and reassuring. Highly recommend!', CURRENT_TIMESTAMP),
(22, 1, 2, 5, 'Excellent cardiologist. Dr. Smith is very knowledgeable and caring. He patiently answered all my questions and made me feel at ease throughout my appointment.', CURRENT_TIMESTAMP),
(24, 3, 4, 4, 'Dr. Wilson provided clear information about my condition and treatment plan. The only reason for not giving 5 stars is the longer than expected waiting time.', CURRENT_TIMESTAMP),
(25, 4, 5, 5, 'Dr. Novak is an exceptional heart specialist. She explained my test results thoroughly and created a comprehensive treatment plan. Her attention to detail is outstanding.', CURRENT_TIMESTAMP),

-- Pediatrics Reviews
(21, 5, 6, 5, 'Dr. Johnson is amazing with children. My son was anxious about the appointment, but she made him feel comfortable right away. Very knowledgeable and patient.', CURRENT_TIMESTAMP),
(23, 7, 8, 4, 'Dr. Clarke is a competent pediatrician who provided good care for my daughter. The clinic was quite busy, but she didn't rush through our appointment.', CURRENT_TIMESTAMP),

-- Dermatology Reviews
(24, 8, 9, 5, 'Dr. Wong is an excellent dermatologist. She identified my skin condition quickly and prescribed an effective treatment. My skin has improved significantly since seeing her.', CURRENT_TIMESTAMP),
(25, 9, 10, 4, 'Dr. Mueller is knowledgeable and provided a good treatment plan for my skin condition. The office was running behind schedule, but the quality of care was worth the wait.', CURRENT_TIMESTAMP),

-- Orthopedics Reviews
(22, 11, 12, 5, 'Dr. Tan is a skilled orthopedic specialist. He explained my knee condition thoroughly using models and diagrams, making it easy to understand my treatment options.', CURRENT_TIMESTAMP),
(23, 12, 13, 5, 'Dr. Gonzalez provided exceptional post-surgical care. Her follow-up was comprehensive, and she was very attentive to my recovery progress. Highly recommend her services.', CURRENT_TIMESTAMP),

-- Neurology Reviews
(25, 14, 16, 4, 'Dr. Kumar is a thorough neurologist who took the time to understand my migraine history. The treatment plan she provided has been effective in reducing my episodes.', CURRENT_TIMESTAMP),
(21, 15, 17, 5, 'Dr. Park really listened to my concerns and conducted a comprehensive assessment. His diagnosis and treatment recommendations have made a significant difference in managing my headaches.', CURRENT_TIMESTAMP),

-- Ophthalmology Reviews
(23, 17, 19, 5, 'Dr. Zhang provided an excellent eye examination. Very thorough and explained all findings clearly. The new prescription has significantly improved my vision.', CURRENT_TIMESTAMP),
(24, 18, 20, 4, 'Dr. Patel was professional and knowledgeable. The eye drops he prescribed have helped with my dry eye symptoms. The clinic was a bit crowded but efficiently run.', CURRENT_TIMESTAMP),

-- Dentistry Reviews
(25, 19, 21, 5, 'Dr. Lee is a gentle and skilled dentist. The cleaning was thorough but comfortable. He provided excellent advice for maintaining good oral hygiene.', CURRENT_TIMESTAMP);