-- 删除旧的列
ALTER TABLE notification_preferences
DROP COLUMN IF EXISTS email_enabled,
DROP COLUMN IF EXISTS sms_enabled,
DROP COLUMN IF EXISTS push_enabled,
DROP COLUMN IF EXISTS reminder_timing,
DROP COLUMN IF EXISTS preferences;

-- 添加新的列
ALTER TABLE notification_preferences
ADD COLUMN IF NOT EXISTS email_appointment BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS email_reminders BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS in_app_notifications BOOLEAN DEFAULT true;

-- 添加唯一约束，确保每个用户只有一条记录
ALTER TABLE notification_preferences
ADD CONSTRAINT notification_preferences_user_id_unique UNIQUE (user_id); 