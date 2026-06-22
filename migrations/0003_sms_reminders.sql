-- Alter appointments table to add reminder flags to prevent duplicate dispatches
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS reminder_24h_sent BOOLEAN DEFAULT FALSE;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS reminder_1h_sent BOOLEAN DEFAULT FALSE;

-- Add index on appointment_date and times for reminder worker efficiency
CREATE INDEX IF NOT EXISTS idx_appointments_reminders_check 
ON appointments(appointment_date, appointment_time) 
WHERE (deleted_at IS NULL AND status = 'confirmed');
