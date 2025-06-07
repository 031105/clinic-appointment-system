-- Migration: Add email verification functionality
-- Date: 2024-12-01

-- Create email_verifications table for OTP storage
CREATE TABLE IF NOT EXISTS email_verifications (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    otp VARCHAR(6) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('registration', 'password_reset')),
    expires_at TIMESTAMP NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    attempts INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_email_verifications_email ON email_verifications(email);
CREATE INDEX IF NOT EXISTS idx_email_verifications_otp ON email_verifications(otp);
CREATE INDEX IF NOT EXISTS idx_email_verifications_expires_at ON email_verifications(expires_at);

-- Add only the must_change_password column if it doesn't exist
-- (email_verified, reset_token, reset_token_expires should already exist)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='must_change_password') THEN
        ALTER TABLE users ADD COLUMN must_change_password BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Create function to clean up expired OTP records
CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS void AS $$
BEGIN
    DELETE FROM email_verifications 
    WHERE expires_at < NOW() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger for updated_at on email_verifications
DROP TRIGGER IF EXISTS update_email_verifications_modtime ON email_verifications;
CREATE TRIGGER update_email_verifications_modtime
    BEFORE UPDATE ON email_verifications
    FOR EACH ROW
    EXECUTE FUNCTION update_modified_column();

-- Insert cleanup job reminder (this would typically be handled by a cron job)
-- You should set up a cron job to run: SELECT cleanup_expired_otps();

COMMENT ON TABLE email_verifications IS 'Stores OTP codes for email verification and password reset';
COMMENT ON COLUMN email_verifications.type IS 'Type of verification: registration or password_reset';
COMMENT ON COLUMN email_verifications.attempts IS 'Number of verification attempts';
COMMENT ON COLUMN users.must_change_password IS 'Whether user must change password on next login (used for temp passwords)'; 