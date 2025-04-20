-- Insert data into medical_records table
INSERT INTO medical_records (patient_id, doctor_id, appointment_id, diagnosis, prescription, notes, created_at) VALUES
(5, 1, 1, 'Mild hypertension', 'Lisinopril 10mg daily', 'Patient advised on lifestyle changes including reduced sodium intake and regular exercise', CURRENT_TIMESTAMP),
(6, 1, 2, 'Coronary artery disease', 'Aspirin 81mg daily, Atorvastatin 20mg daily', 'Medication appears effective. Scheduled follow-up in 3 months.', CURRENT_TIMESTAMP),
(8, 3, 4, 'Minor dental caries', 'Fluoride rinse after brushing', 'Fillings completed for two cavities. Patient advised on improved brushing technique.', CURRENT_TIMESTAMP),
(9, 2, 5, 'Seasonal allergic rhinitis', 'Cetirizine 10mg daily as needed', 'Symptoms expected to improve as pollen count decreases', CURRENT_TIMESTAMP),
(7, 1, 8, 'Controlled hypertension', 'Continue current medication regimen', 'Blood pressure readings within normal range: 122/78. Continue monitoring at home.', CURRENT_TIMESTAMP);
