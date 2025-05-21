/*
 * 部门表Emoji图标添加脚本
 * 
 * 使用方法:
 * 1. 连接到数据库: psql -d clinic_appointment_system
 * 2. 执行脚本: \i server/db/add_emoji_icon.sql
 * 3. 确认更改: SELECT name, emoji_icon FROM departments;
 */

-- 1. 添加emoji_icon列到departments表
ALTER TABLE IF EXISTS departments ADD COLUMN IF NOT EXISTS emoji_icon VARCHAR(100);

-- 2. 更新现有部门的emoji_icon值
UPDATE departments SET emoji_icon = '❤️' WHERE name = 'Cardiology';
UPDATE departments SET emoji_icon = '👶' WHERE name = 'Pediatrics';
UPDATE departments SET emoji_icon = '✏️' WHERE name = 'Dermatology';
UPDATE departments SET emoji_icon = '🦴' WHERE name = 'Orthopedics';
UPDATE departments SET emoji_icon = '🧠' WHERE name = 'Neurology';
UPDATE departments SET emoji_icon = '👁️' WHERE name = 'Ophthalmology';
UPDATE departments SET emoji_icon = '🦷' WHERE name = 'Dentistry';
UPDATE departments SET emoji_icon = '🧪' WHERE name = 'Laboratory';
UPDATE departments SET emoji_icon = '💉' WHERE name = 'Vaccination';
UPDATE departments SET emoji_icon = '👨‍⚕️' WHERE name IS NOT NULL AND emoji_icon IS NULL;

-- 3. 确保将来创建的departments都有emoji_icon值
ALTER TABLE departments ALTER COLUMN emoji_icon SET DEFAULT '👨‍⚕️'; 