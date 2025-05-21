-- 更新所有用户地址为标准化格式

-- 已经更新过的用户（保持不变）
-- 1, 2, 3, 4, 12, 14

-- 更新剩余医生地址
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
SET address = 'Block B-3, Hospital Staff Quarters, Jalan Medic 3/11, 56000 Kuala Lumpur, Wilayah Persekutuan'
WHERE user_id = 10;

UPDATE users 
SET address = 'Apartment 8A, Tower C, Doctor Residence, 43400 Serdang, Selangor'
WHERE user_id = 11;

-- 更新剩余患者地址
UPDATE users 
SET address = 'No. 123, Jalan Patient, Taman Wellness, 56000 Cheras, Kuala Lumpur'
WHERE user_id = 5;

UPDATE users 
SET address = 'Unit 7-15, Block D, Patient Residences, 14000 Bukit Mertajam, Penang'
WHERE user_id = 6;

UPDATE users 
SET address = '456, Jalan Recovery, Taman Wellness, 11600 Georgetown, Pulau Pinang'
WHERE user_id = 13;

-- 任何尚未指定的用户
UPDATE users
SET address = 'No. 1, Jalan Klinik, Taman Kesihatan, 50000 Kuala Lumpur, Wilayah Persekutuan'
WHERE address IS NULL OR address = '';

-- 更新所有尚未更新的用户地址（如果有简单地址格式）
UPDATE users
SET address = CASE 
    WHEN address LIKE '%Doctor St%' THEN REPLACE(address, 'Doctor St', 'Jalan Doctor, Taman Medical, 56000 Kuala Lumpur, Wilayah Persekutuan')
    WHEN address LIKE '%Patient St%' THEN REPLACE(address, 'Patient St', 'Jalan Patient, Taman Wellness, 55100 Kuala Lumpur, Wilayah Persekutuan')
    ELSE address
END
WHERE address LIKE '%Doctor St%' OR address LIKE '%Patient St%';