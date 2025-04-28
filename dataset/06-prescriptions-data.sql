-- Create consultations data (required for prescriptions in the database schema)
INSERT INTO consultations (appointment_id, diagnosis, prescription, follow_up_required, follow_up_date) VALUES
(1, 'Hypertension', 'Lisinopril 10mg daily, Atorvastatin 20mg daily', TRUE, '2023-09-15'),
(3, 'Migraine', 'Sumatriptan 50mg as needed for migraines', TRUE, '2023-12-25'),
(5, 'Type 2 Diabetes', 'Metformin 500mg twice daily', TRUE, '2023-11-01'),
(6, 'Osteoarthritis of the knee', 'Naproxen 500mg twice daily as needed for pain', TRUE, '2023-08-25'),
(7, 'Atopic dermatitis', 'Hydrocortisone cream 1% to affected areas twice daily', TRUE, '2023-07-19'),
(8, 'Generalized anxiety disorder', 'Escitalopram 10mg daily', TRUE, '2023-07-21'),
(9, 'Hormone imbalance', 'Estradiol 1mg daily', TRUE, '2023-12-15'),
(10, 'Coronary artery disease', 'Amlodipine 5mg daily', TRUE, '2023-09-17'),
(11, 'Routine examination', 'Prenatal vitamin daily', FALSE, NULL),
(12, 'Rheumatoid arthritis', 'Methotrexate 15mg weekly, Folic acid 1mg daily except on methotrexate day', TRUE, '2023-08-28'),
(13, 'Hypertension', 'Losartan 50mg daily', TRUE, '2023-09-15'),
(14, 'Eczema', 'Triamcinolone cream 0.1% to affected areas twice daily', TRUE, '2023-07-24'),
(15, 'Major depressive disorder', 'Sertraline 50mg daily', TRUE, '2023-09-30'),
(16, 'Gastroesophageal reflux disease', 'Omeprazole 20mg daily before breakfast', TRUE, '2023-09-05');

-- Insert data into medical records table
INSERT INTO medical_records (patient_id, doctor_id, appointment_id, record_type, title, description, date_of_record, diagnosis, prescription, notes, created_at, updated_at) VALUES
-- Records for Patient 1 (user_id: 15)
(15, 3, 1, 'consultation', 'Hypertension Follow-up', 'Regular check-up for hypertension management', '2023-06-15', 'Hypertension, Grade 1', '["Lisinopril 10mg daily", "Atorvastatin 20mg daily"]', 'Blood pressure readings: 150/95. Follow-up in 3 months. Patient advised on dietary changes and regular exercise.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(15, 8, 2, 'consultation', 'Allergy Assessment', 'Evaluation of seasonal allergies', '2023-06-22', 'Seasonal allergic rhinitis', '["Cetirizine 10mg daily"]', 'Patient experiences increased symptoms in spring season. Skin test positive for multiple pollens.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Records for Patient 2 (user_id: 16)
(16, 5, 3, 'consultation', 'Migraine Assessment', 'Evaluation and management of chronic migraines', '2023-06-18', 'Chronic migraine without aura', '["Sumatriptan 50mg as needed"]', 'Patient reports stress and bright lights as triggers. Recommend keeping a migraine diary.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(16, 7, 4, 'procedure', 'Dental Procedure', 'Routine dental check-up and cleaning', '2023-07-10', 'Dental caries', '["Fluoride toothpaste"]', 'Two cavities filled in lower molars. Stressed importance of flossing.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Records for Patient 3 (user_id: 17)
(17, 3, 5, 'consultation', 'Diabetes Management', 'Regular check-up for diabetes', '2023-06-20', 'Type 2 Diabetes Mellitus', '["Metformin 500mg twice daily"]', 'HbA1c: 7.8%. Needs better glucose control. Review again in 3 months.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(17, 6, 6, 'consultation', 'Knee Pain Evaluation', 'Assessment of chronic knee pain', '2023-06-25', 'Osteoarthritis of the knee', '["Naproxen 500mg twice daily as needed"]', 'X-rays show moderate joint space narrowing. Referred to physical therapy for 8 weeks.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Records for Patient 4 (user_id: 18)
(18, 5, 7, 'consultation', 'Skin Condition Follow-up', 'Follow-up for dermatitis treatment', '2023-06-19', 'Atopic dermatitis', '["Hydrocortisone cream 1% twice daily"]', 'Flare-ups on hands and neck. Advised to avoid fragranced products.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Records for Patient 5 (user_id: 19)
(19, 12, 8, 'consultation', 'Anxiety Treatment', 'Therapy session for anxiety management', '2023-06-21', 'Generalized anxiety disorder', '["Escitalopram 10mg daily"]', 'Patient reports improved symptoms after 4 weeks of medication. Continue therapy sessions.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(19, 11, 9, 'consultation', 'Hormone Therapy', 'Assessment for hormone replacement therapy', '2023-07-20', 'Perimenopausal symptoms', '["Estradiol 1mg daily"]', 'Ultrasound shows no abnormalities. Follow-up in 3 months to assess treatment efficacy.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Records for Patient 6 (user_id: 20)
(20, 3, 10, 'consultation', 'Cardiac Evaluation', 'Post-bypass surgery follow-up', '2023-06-17', 'Coronary artery disease, post CABG', '["Amlodipine 5mg daily", "Aspirin 81mg daily"]', 'Post-bypass monitoring shows good recovery. Stress test scheduled for next month.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Records for Patient 7 (user_id: 21)
(21, 11, 11, 'consultation', 'Women\'s Health Check-up', 'Annual gynecological examination', '2023-08-10', 'Routine gynecological examination', '["Prenatal vitamin daily"]', 'All findings normal. Recommended HPV vaccination.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Records for Patient 8 (user_id: 22)
(22, 6, 12, 'consultation', 'Arthritis Management', 'Evaluation of rheumatoid arthritis treatment', '2023-06-28', 'Rheumatoid arthritis', '["Methotrexate 15mg weekly", "Folic acid 1mg daily"]', 'Joint pain in hands and knees. X-rays confirm diagnosis. Review in 6 weeks.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(22, 3, 13, 'consultation', 'Blood Pressure Management', 'Virtual follow-up for hypertension', '2023-07-15', 'Hypertension, Grade 2', '["Losartan 50mg daily"]', 'Blood pressure: 160/100. Start medication and lifestyle changes immediately.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Records for Patient 9 (user_id: 23)
(23, 5, 14, 'consultation', 'Eczema Treatment Review', 'Follow-up for skin condition', '2023-06-24', 'Eczema, moderate', '["Triamcinolone cream 0.1% twice daily"]', 'Flare-ups on elbows and behind knees. Patch testing scheduled to identify potential triggers.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),

-- Records for Patient 10 (user_id: 24)
(24, 12, 15, 'consultation', 'Depression Management', 'Therapy session and medication review', '2023-06-30', 'Major depressive disorder', '["Sertraline 50mg daily"]', 'Patient reports moderate improvement after 6 weeks of treatment. Continue current regimen.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(24, 8, 16, 'consultation', 'GERD Management', 'Virtual follow-up for acid reflux', '2023-07-05', 'Gastroesophageal reflux disease', '["Omeprazole 20mg daily before breakfast"]', 'Symptoms worsen at night and after spicy foods. Recommended elevating head during sleep.', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);