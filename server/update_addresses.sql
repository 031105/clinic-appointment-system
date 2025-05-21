-- 更新用户地址为更完整的格式

-- 更新管理员地址
UPDATE users 
SET address = 'Level 20, Tower 1, Admin Complex, 10001 Kuala Lumpur, Federal Territory'
WHERE user_id = 1;

-- 更新诊所经理地址
UPDATE users 
SET address = 'No. 456, Jalan Manager, Taman Healthcare, 50450 Kuala Lumpur, Wilayah Persekutuan'
WHERE user_id = 2;

-- 更新医生地址
UPDATE users 
SET address = 'Block A, No. 789, Jalan Medic, Bukit Medical Heights, 47500 Petaling Jaya, Selangor'
WHERE user_id = 3;

UPDATE users 
SET address = 'Unit 12-08, Menara Doctor, 345 Jalan Physician, 55100 Kuala Lumpur, Wilayah Persekutuan'
WHERE user_id = 7;

UPDATE users 
SET address = '15, Lorong Healthcare 8/3, Taman Physician, 40000 Shah Alam, Selangor'
WHERE user_id = 8;

UPDATE users 
SET address = 'No. 567, Jalan Specialist, SS15, 47300 Subang Jaya, Selangor'
WHERE user_id = 9;

UPDATE users 
SET address = 'Apartment 23A, Medical Residences, 890 Jalan Clinician, 80300 Johor Bahru, Johor'
WHERE user_id = 12;

-- 更新患者地址
UPDATE users 
SET address = 'No. 123, Jalan Patient, Taman Wellness, 56000 Cheras, Kuala Lumpur'
WHERE user_id = 5;

UPDATE users 
SET address = '18-2, Residensi Harmony, Jalan Healthy Living, 43300 Seri Kembangan, Selangor'
WHERE user_id = 14;

UPDATE users 
SET address = '456, Jalan Recovery, Taman Wellness, 11600 Penang, Pulau Pinang'
WHERE user_id = 13; 