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
SET address = 'No. 789, Jalan Doktor, Taman Medical, 56000 Kuala Lumpur, Wilayah Persekutuan'
WHERE user_id = 3;

UPDATE users 
SET address = 'Blok A-15-3, Apartment Medic, Jalan Health, 47500 Subang Jaya, Selangor'
WHERE user_id = 4;

UPDATE users 
SET address = '12, Jalan Pakar 5/7, Taman Specialist, 43650 Bandar Baru Bangi, Selangor'
WHERE user_id = 12;

-- 更新病人地址
UPDATE users 
SET address = 'No. 789, Jalan Patient, Taman Wellness, 55100 Kuala Lumpur, Wilayah Persekutuan'
WHERE user_id = 14;

UPDATE users 
SET address = '25-7, Jalan Sehat 3/5, Taman Recovery, 40150 Shah Alam, Selangor'
WHERE user_id = 15;

UPDATE users 
SET address = 'No. 567, Lorong Health, Taman Wellbeing, 47500 Subang Jaya, Selangor'
WHERE user_id = 16; 