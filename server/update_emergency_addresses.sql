-- 更新紧急联系人地址为更完整的格式

-- 更新ID为1的紧急联系人地址
UPDATE emergency_contacts 
SET address = '18-5, Jalan Keluarga 5/7, Taman Family, 56000 Kuala Lumpur, Wilayah Persekutuan'
WHERE contact_id = 1;

-- 更新ID为2的紧急联系人地址
UPDATE emergency_contacts 
SET address = 'No. 100, Jalan Keluarga, Taman Harmony, 47100 Puchong, Selangor'
WHERE contact_id = 2;

-- 更新ID为3的紧急联系人地址
UPDATE emergency_contacts 
SET address = 'Unit 12-3A, Block C, Family Apartments, 40150 Shah Alam, Selangor'
WHERE contact_id = 3;

-- 更新ID为4的紧急联系人地址
UPDATE emergency_contacts 
SET address = 'Level 15, Tower B, Family Residence, 40150 Shah Alam, Selangor'
WHERE contact_id = 4;

-- 更新任何其他紧急联系人地址
UPDATE emergency_contacts
SET address = 'No. 123, Jalan Emergency, Taman Safety, 50300 Kuala Lumpur, Wilayah Persekutuan'
WHERE contact_id > 4 OR address IS NULL OR address = ''; 