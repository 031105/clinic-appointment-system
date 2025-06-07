-- 添加患者笔记表
CREATE TABLE IF NOT EXISTS patient_notes (
  note_id SERIAL PRIMARY KEY,
  patient_id INTEGER NOT NULL REFERENCES patients(patient_id),
  doctor_id INTEGER NOT NULL REFERENCES users(user_id),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_patient_notes_patient FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
  CONSTRAINT fk_patient_notes_doctor FOREIGN KEY (doctor_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 添加预约时长统计表
CREATE TABLE IF NOT EXISTS appointment_durations (
  duration_id SERIAL PRIMARY KEY,
  appointment_id INTEGER NOT NULL REFERENCES appointments(appointment_id),
  actual_duration INTEGER NOT NULL, -- 实际持续时间（分钟）
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_appointment_durations_appointment FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id) ON DELETE CASCADE
);

-- 添加预约类型枚举
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'appointment_type') THEN
    CREATE TYPE appointment_type AS ENUM ('checkup', 'followup', 'consultation', 'emergency');
  END IF;
END $$;

-- 更新预约表，添加类型字段
ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS type appointment_type NOT NULL DEFAULT 'checkup',
ADD COLUMN IF NOT EXISTS end_datetime TIMESTAMP WITH TIME ZONE;

-- 创建触发器函数，自动更新时间戳
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 为相关表添加更新时间戳触发器
CREATE TRIGGER update_patient_notes_timestamp
  BEFORE UPDATE ON patient_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_timestamp();

-- 添加索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_datetime ON appointments(doctor_id, appointment_datetime);
CREATE INDEX IF NOT EXISTS idx_patient_notes_doctor_created ON patient_notes(doctor_id, created_at);
CREATE INDEX IF NOT EXISTS idx_appointments_type ON appointments(type);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status); 