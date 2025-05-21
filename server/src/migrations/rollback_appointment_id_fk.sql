-- Drop the trigger first
DROP TRIGGER IF EXISTS medical_record_after_insert ON medical_records;

-- Drop the trigger function
DROP FUNCTION IF EXISTS update_appointment_status_on_medical_record();

-- Drop the index
DROP INDEX IF EXISTS idx_medical_records_appointment_id;

-- Drop the foreign key constraint
ALTER TABLE medical_records
DROP CONSTRAINT IF EXISTS fk_medical_records_appointment; 