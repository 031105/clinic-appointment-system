-- Insert data into patients table
INSERT INTO patients (patient_id, date_of_birth, gender, blood_type, medical_history, created_at, updated_at) VALUES
-- Patient 1
(15, '1985-04-12', 'male', 'O+', 'Hypertension, Allergic to penicillin', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
-- Patient 2
(16, '1990-08-23', 'female', 'A+', 'Asthma, Migraine', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
-- Patient 3
(17, '1978-11-05', 'male', 'B-', 'Diabetes Type 2, Cholesterol', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
-- Patient 4
(18, '1993-02-17', 'female', 'AB+', 'Seasonal allergies', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
-- Patient 5
(19, '1982-06-30', 'female', 'A-', 'Thyroid disorder, Anxiety', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
-- Patient 6
(20, '1975-09-15', 'male', 'O-', 'Heart disease, Had bypass surgery in 2018', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
-- Patient 7
(21, '1998-12-03', 'female', 'B+', 'No significant medical history', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
-- Patient 8
(22, '1967-03-21', 'male', 'AB-', 'Arthritis, High blood pressure', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
-- Patient 9
(23, '1995-07-08', 'female', 'O+', 'Eczema, Food allergies (nuts)', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
-- Patient 10
(24, '1980-01-19', 'male', 'A+', 'Depression, GERD', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert data into patient insurance info table
INSERT INTO patient_insurance (patient_id, provider, policy_number, group_number, valid_from, valid_until) VALUES
-- Patient 1 insurance
(15, 'BlueCross', 'BC123456789', 'BC-GROUP-123', '2023-01-01', '2023-12-31'),
-- Patient 2 insurance
(16, 'Aetna', 'AE987654321', 'AE-GROUP-456', '2023-01-01', '2023-12-31'),
-- Patient 3 insurance
(17, 'United Health', 'UH456789123', 'UH-GROUP-789', '2023-01-01', '2023-12-31'),
-- Patient 4 insurance
(18, 'Cigna', 'CI789123456', 'CI-GROUP-012', '2023-01-01', '2023-12-31'),
-- Patient 5 insurance
(19, 'Humana', 'HU321654987', 'HU-GROUP-345', '2023-01-01', '2023-12-31'),
-- Patient 6 insurance
(20, 'Kaiser', 'KA654987321', 'KA-GROUP-678', '2023-01-01', '2023-12-31'),
-- Patient 7 insurance
(21, 'Medicare', 'ME987321654', 'ME-GROUP-901', '2023-01-01', '2023-12-31'),
-- Patient 8 insurance
(22, 'BlueCross', 'BC234567891', 'BC-GROUP-234', '2023-01-01', '2023-12-31'),
-- Patient 9 insurance
(23, 'Aetna', 'AE876543219', 'AE-GROUP-567', '2023-01-01', '2023-12-31'),
-- Patient 10 insurance
(24, 'United Health', 'UH543219876', 'UH-GROUP-890', '2023-01-01', '2023-12-31');

-- Insert data into patient_allergies table
INSERT INTO patient_allergies (patient_id, name, severity, reaction, notes, created_at, updated_at) VALUES
-- Patient 1 allergies (user_id: 15)
(15, 'Penicillin', 'high', 'Anaphylaxis', 'Causes severe reactions', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(15, 'Dust mites', 'medium', 'Sneezing and wheezing', 'Worse during cleaning', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
-- Patient 2 allergies (user_id: 16)
(16, 'Pollen', 'medium', 'Seasonal rhinitis', 'Worse in spring', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(16, 'Shellfish', 'high', 'Hives and difficulty breathing', 'All types of shellfish', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
-- Patient 3 allergies (user_id: 17)
(17, 'Sulfa drugs', 'medium', 'Skin rash', 'Redness and itching', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
-- Patient 4 allergies (user_id: 18)
(18, 'Peanuts', 'high', 'Anaphylaxis risk', 'Carries EpiPen', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(18, 'Cats', 'low', 'Sneezing', 'Mild symptoms', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(18, 'Ragweed', 'medium', 'Seasonal allergic rhinitis', 'Fall allergy', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
-- Patient 5 allergies (user_id: 19)
(19, 'Latex', 'medium', 'Skin irritation and hives', 'Medical gloves and bandages', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
-- Patient 9 allergies (user_id: 23)
(23, 'Tree nuts', 'high', 'Anaphylaxis risk', 'All tree nuts', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(23, 'Eggs', 'medium', 'Hives and stomach upset', 'Can tolerate in baked goods', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Insert data into emergency_contacts table
INSERT INTO emergency_contacts (patient_id, name, relationship, phone, address, is_default, created_at, updated_at) VALUES
-- Contacts for Patient 1 (user_id: 15)
(15, 'Mary Johnson', 'Spouse', '555-123-4567', '{"street": "123 Apple St", "city": "New York", "state": "NY", "zipCode": "10001", "country": "United States"}', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(15, 'James Johnson', 'Son', '555-987-6543', '{"street": "456 Orange Ave", "city": "New York", "state": "NY", "zipCode": "10002", "country": "United States"}', FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
-- Contacts for Patient 2 (user_id: 16)
(16, 'David Williams', 'Husband', '555-234-5678', '{"street": "789 Grape Blvd", "city": "Los Angeles", "state": "CA", "zipCode": "90001", "country": "United States"}', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
-- Contacts for Patient 3 (user_id: 17)
(17, 'Jennifer Brown', 'Wife', '555-345-6789', '{"street": "321 Cherry Lane", "city": "Chicago", "state": "IL", "zipCode": "60007", "country": "United States"}', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(17, 'Michael Brown', 'Brother', '555-654-3210', '{"street": "654 Plum Court", "city": "Chicago", "state": "IL", "zipCode": "60008", "country": "United States"}', FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
-- Contacts for Patient 4 (user_id: 18)
(18, 'Thomas Miller', 'Boyfriend', '555-456-7890', '{"street": "987 Pear Drive", "city": "Houston", "state": "TX", "zipCode": "77001", "country": "United States"}', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
-- Contacts for Patient 5 (user_id: 19)
(19, 'Robert Davis', 'Husband', '555-567-8901', '{"street": "741 Banana Street", "city": "Phoenix", "state": "AZ", "zipCode": "85001", "country": "United States"}', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
-- Contacts for Patient 6 (user_id: 20)
(20, 'Patricia Garcia', 'Wife', '555-678-9012', '{"street": "852 Lemon Road", "city": "Philadelphia", "state": "PA", "zipCode": "19019", "country": "United States"}', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
(20, 'Christopher Garcia', 'Son', '555-789-0123', '{"street": "963 Lime Avenue", "city": "Philadelphia", "state": "PA", "zipCode": "19020", "country": "United States"}', FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
-- Contacts for Patient 7 (user_id: 21)
(21, 'Michael Wilson', 'Father', '555-789-0123', '{"street": "159 Strawberry Court", "city": "San Antonio", "state": "TX", "zipCode": "78006", "country": "United States"}', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
-- Contacts for Patient 8 (user_id: 22)
(22, 'Elizabeth Martinez', 'Daughter', '555-890-1234', '{"street": "357 Blueberry Lane", "city": "San Diego", "state": "CA", "zipCode": "92093", "country": "United States"}', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
-- Contacts for Patient 9 (user_id: 23)
(23, 'Charles Anderson', 'Husband', '555-901-2345', '{"street": "468 Raspberry Road", "city": "Dallas", "state": "TX", "zipCode": "75001", "country": "United States"}', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
-- Contacts for Patient 10 (user_id: 24)
(24, 'Linda Thomas', 'Sister', '555-012-3456', '{"street": "579 Blackberry Street", "city": "San Jose", "state": "CA", "zipCode": "95101", "country": "United States"}', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP); 