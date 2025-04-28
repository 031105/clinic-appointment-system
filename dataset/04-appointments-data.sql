-- Insert data into appointments table
INSERT INTO appointments (patient_id, doctor_id, appointment_datetime, end_datetime, duration, type, status, reason, notes, created_by) VALUES
-- Appointments for Patient 1 (user_id: 15)
(15, 3, '2023-06-15 09:00:00', '2023-06-15 09:30:00', 30, 'in-person', 'scheduled', 'Blood pressure check-up', 'Regular follow-up for hypertension monitoring', 15),
(15, 8, '2023-06-22 14:30:00', '2023-06-22 15:00:00', 30, 'in-person', 'scheduled', 'Allergy consultation', 'Discuss management strategy for seasonal allergies', 15),
-- Appointments for Patient 2 (user_id: 16)
(16, 5, '2023-06-18 10:00:00', '2023-06-18 10:30:00', 30, 'in-person', 'scheduled', 'Migraine follow-up', 'Review effectiveness of prescribed medication', 16),
(16, 7, '2023-07-10 11:15:00', '2023-07-10 12:00:00', 45, 'in-person', 'scheduled', 'Dental cleaning', 'Regular 6-month dental checkup and cleaning', 16),
-- Appointments for Patient 3 (user_id: 17)
(17, 3, '2023-06-20 13:00:00', '2023-06-20 13:30:00', 30, 'in-person', 'scheduled', 'Diabetes management', 'Review blood glucose levels and medication adjustment', 17),
(17, 6, '2023-06-25 15:30:00', '2023-06-25 16:00:00', 30, 'in-person', 'scheduled', 'Knee pain assessment', 'Follow-up on physical therapy progress', 17),
-- Appointments for Patient 4 (user_id: 18)
(18, 5, '2023-06-19 09:45:00', '2023-06-19 10:15:00', 30, 'virtual', 'scheduled', 'Skin condition follow-up', 'Check improvement of dermatitis after treatment', 18),
-- Appointments for Patient 5 (user_id: 19)
(19, 12, '2023-06-21 16:00:00', '2023-06-21 17:00:00', 60, 'in-person', 'scheduled', 'Therapy session', 'Regular anxiety management session', 19),
(19, 11, '2023-07-20 11:00:00', '2023-07-20 11:30:00', 30, 'in-person', 'scheduled', 'Hormone therapy follow-up', 'Assess efficacy of hormonal treatment', 19),
-- Appointments for Patient 6 (user_id: 20)
(20, 3, '2023-06-17 08:30:00', '2023-06-17 09:00:00', 30, 'in-person', 'scheduled', 'Cardiac evaluation', 'Post-surgery follow-up and stress test results review', 20),
-- Appointments for Patient 7 (user_id: 21)
(21, 11, '2023-08-10 14:00:00', '2023-08-10 14:30:00', 30, 'in-person', 'scheduled', 'Women''s health check-up', 'Annual gynecological examination', 21),
-- Appointments for Patient 8 (user_id: 22)
(22, 6, '2023-06-28 10:30:00', '2023-06-28 11:00:00', 30, 'in-person', 'scheduled', 'Arthritis management', 'Evaluate response to methotrexate treatment', 22),
(22, 3, '2023-07-15 09:15:00', '2023-07-15 09:45:00', 30, 'virtual', 'scheduled', 'Blood pressure follow-up', 'Check effectiveness of amlodipine treatment', 22),
-- Appointments for Patient 9 (user_id: 23)
(23, 5, '2023-06-24 13:45:00', '2023-06-24 14:15:00', 30, 'in-person', 'scheduled', 'Eczema treatment review', 'Assess skin condition and treatment efficacy', 23),
-- Appointments for Patient 10 (user_id: 24)
(24, 12, '2023-06-30 15:00:00', '2023-06-30 16:00:00', 60, 'in-person', 'scheduled', 'Therapy session', 'Depression management and medication review', 24),
(24, 8, '2023-07-05 11:30:00', '2023-07-05 12:00:00', 30, 'virtual', 'scheduled', 'GERD follow-up', 'Review symptoms after medication and lifestyle changes', 24),
-- Some past appointments
(15, 3, '2023-05-15 09:00:00', '2023-05-15 09:30:00', 30, 'in-person', 'completed', 'Blood pressure check-up', 'BP readings improved to 140/85. Continue current medication.', 15),
(16, 5, '2023-05-18 10:00:00', '2023-05-18 10:30:00', 30, 'in-person', 'completed', 'Migraine evaluation', 'Prescribed sumatriptan for acute attacks. Patient to track frequency.', 16),
(17, 3, '2023-04-20 13:00:00', '2023-04-20 13:30:00', 30, 'in-person', 'completed', 'Diabetes check-up', 'Fasting glucose: 145 mg/dL. Increased metformin dosage.', 17),
(18, 5, '2023-05-19 09:45:00', '2023-05-19 10:15:00', 30, 'virtual', 'completed', 'Initial dermatology consultation', 'Diagnosed with atopic dermatitis. Prescribed hydrocortisone.', 18),
(19, 12, '2023-05-21 16:00:00', '2023-05-21 17:00:00', 60, 'in-person', 'completed', 'Initial psychiatric evaluation', 'Diagnosed with GAD. Started on escitalopram.', 19),
(20, 3, '2023-05-17 08:30:00', '2023-05-17 09:00:00', 30, 'in-person', 'completed', 'Cardiac check-up', 'EKG shows normal rhythm. Continue current medication regimen.', 20),
(22, 6, '2023-05-28 10:30:00', '2023-05-28 11:00:00', 30, 'in-person', 'completed', 'Joint pain consultation', 'Diagnosed with rheumatoid arthritis. Started on methotrexate.', 22),
(23, 5, '2023-05-24 13:45:00', '2023-05-24 14:15:00', 30, 'in-person', 'completed', 'Skin condition evaluation', 'Confirmed eczema diagnosis. Prescribed triamcinolone cream.', 23),
(24, 12, '2023-05-30 15:00:00', '2023-05-30 16:00:00', 60, 'in-person', 'completed', 'Mental health assessment', 'Diagnosed with MDD. Started on sertraline.', 24),
-- Some cancelled appointments
(15, 8, '2023-05-10 14:30:00', '2023-05-10 15:00:00', 30, 'in-person', 'cancelled', 'Allergy testing', 'Patient called to reschedule due to work conflict.', 15),
(16, 7, '2023-05-05 11:15:00', '2023-05-05 12:00:00', 45, 'in-person', 'cancelled', 'Dental cleaning', 'Cancelled due to dentist illness. Rescheduled for July.', 16),
(21, 11, '2023-05-12 14:00:00', '2023-05-12 14:30:00', 30, 'in-person', 'cancelled', 'Women''s health check-up', 'Patient requested to reschedule to later date due to travel.', 21),
(24, 8, '2023-05-20 11:30:00', '2023-05-20 12:00:00', 30, 'virtual', 'no_show', 'GERD initial consultation', 'Patient did not attend virtual appointment. Follow-up call made.', 24); 