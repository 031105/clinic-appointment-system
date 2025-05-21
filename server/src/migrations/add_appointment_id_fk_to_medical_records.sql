-- Add foreign key constraint between medical_records and appointments tables
ALTER TABLE medical_records
ADD CONSTRAINT fk_medical_records_appointment
FOREIGN KEY (appointment_id)
REFERENCES appointments(appointment_id)
ON DELETE SET NULL
ON UPDATE CASCADE;

-- Add an index to improve query performance
CREATE INDEX idx_medical_records_appointment_id ON medical_records(appointment_id);

-- Update existing records that may have invalid appointment_id values (set to NULL if appointment doesn't exist)
UPDATE medical_records
SET appointment_id = NULL
WHERE appointment_id IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM appointments 
    WHERE appointments.appointment_id = medical_records.appointment_id
);

-- Add a trigger to update appointment status to 'COMPLETED' when a medical record is created
CREATE OR REPLACE FUNCTION update_appointment_status_on_medical_record()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.appointment_id IS NOT NULL THEN
        UPDATE appointments
        SET status = 'COMPLETED', updated_at = NOW()
        WHERE appointment_id = NEW.appointment_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER medical_record_after_insert
AFTER INSERT ON medical_records
FOR EACH ROW
EXECUTE FUNCTION update_appointment_status_on_medical_record(); 