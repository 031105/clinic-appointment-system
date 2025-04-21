-- Insert data into medical_records table
INSERT INTO medical_records (patient_id, doctor_id, appointment_id, diagnosis, prescription, notes, created_at) VALUES
-- Cardiology Medical Records
(21, 1, 1, 'Mild hypertension', 'Lisinopril 10mg daily', 'Patient advised on lifestyle changes including reduced sodium intake and regular exercise. Blood pressure readings: 145/92.', CURRENT_TIMESTAMP),
(22, 1, 2, 'Stable coronary artery disease', 'Aspirin 81mg daily, Atorvastatin 20mg daily', 'Current medication regimen appears effective. Patient reports improved tolerance to physical activity. Scheduled follow-up in 3 months.', CURRENT_TIMESTAMP),
(24, 3, 4, 'Atrial fibrillation', 'Warfarin 5mg daily, Metoprolol 25mg twice daily', 'INR within therapeutic range. Patient experiencing good rhythm control. Discussed importance of regular monitoring.', CURRENT_TIMESTAMP),
(25, 4, 5, 'Congestive heart failure', 'Furosemide 40mg daily, Carvedilol 6.25mg twice daily', 'Showing improvement in symptoms. Minor peripheral edema present. Recommended continued fluid restriction and daily weight monitoring.', CURRENT_TIMESTAMP),

-- Pediatrics Medical Records
(21, 5, 6, 'Routine well-child visit', 'Vitamin D3 1000IU daily', 'Growth and development appropriate for age. Completed scheduled vaccinations. Discussed nutrition guidelines with parents.', CURRENT_TIMESTAMP),
(23, 7, 8, 'Acute otitis media', 'Amoxicillin 250mg/5mL, 5mL twice daily for 10 days', 'Right ear infection. Recommended warm compress and adequate hydration. Return if symptoms worsen or persist beyond antibiotic course.', CURRENT_TIMESTAMP),

-- Dermatology Medical Records
(24, 8, 9, 'Moderate acne vulgaris', 'Tretinoin 0.025% cream, apply thin layer at bedtime', 'Acne primarily concentrated on forehead and cheeks. Discussed proper skincare routine and importance of sun protection. Follow-up in 6 weeks.', CURRENT_TIMESTAMP),
(25, 9, 10, 'Seborrheic dermatitis', 'Ketoconazole 2% shampoo, use 2-3 times weekly', 'Scaling and mild erythema noted on scalp and eyebrows. Discussed triggers and long-term management strategy. Follow-up in 4 weeks.', CURRENT_TIMESTAMP),

-- Orthopedics Medical Records
(22, 11, 12, 'Degenerative joint disease, right knee', 'Naproxen 500mg twice daily, glucosamine sulfate 500mg three times daily', 'Moderate osteoarthritis changes on X-ray. Recommended physical therapy for strengthening exercises. Discussed weight management for joint health.', CURRENT_TIMESTAMP),
(23, 12, 13, 'Post-operative recovery, rotator cuff repair', 'Hydrocodone/APAP 5/325mg every 6 hours as needed for pain', 'Surgical wound healing well with no signs of infection. Range of motion exercises prescribed as per protocol. Scheduled physical therapy sessions.', CURRENT_TIMESTAMP),

-- Neurology Medical Records
(25, 14, 16, 'Migraine without aura', 'Sumatriptan 50mg at onset of migraine, max 100mg in 24 hours', 'Patient reports 2-3 episodes monthly, typically triggered by stress and poor sleep. Recommended headache diary and sleep hygiene measures.', CURRENT_TIMESTAMP),
(21, 15, 17, 'Tension-type headache', 'Ibuprofen 400mg as needed for pain', 'Bilateral, non-pulsating headache associated with neck tension. Recommended stress management techniques and ergonomic assessment of workspace.', CURRENT_TIMESTAMP),

-- Ophthalmology Medical Records
(23, 17, 19, 'Myopia with astigmatism', 'Updated prescription for corrective lenses', 'Visual acuity: OD 20/70, OS 20/60, corrected to 20/20 OU. No signs of retinal issues. Recommended yearly follow-up.', CURRENT_TIMESTAMP),
(24, 18, 20, 'Dry eye syndrome', 'Artificial tears, 1-2 drops in each eye 4 times daily', 'Mild corneal staining noted. Discussed environmental factors and computer use. Recommended use of humidifier and increased blinking exercises.', CURRENT_TIMESTAMP),

-- Dentistry Medical Records
(25, 19, 21, 'Gingivitis', 'Chlorhexidine 0.12% oral rinse, twice daily for 2 weeks', 'Moderate gingival inflammation noted, particularly in posterior regions. Performed professional cleaning. Emphasized importance of improved flossing technique.', CURRENT_TIMESTAMP);