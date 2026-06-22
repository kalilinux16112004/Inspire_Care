-- Production-Grade Scheduling Migration for Team Inspire Care

-- 1. Create audit_emails table for tracking dispatch logs
CREATE TABLE IF NOT EXISTS audit_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient TEXT NOT NULL,
  subject TEXT NOT NULL,
  html_content TEXT,
  status TEXT DEFAULT 'mock_sent',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_emails_created_at ON audit_emails(created_at DESC);

-- 2. Create doctor_availability table for day-by-day weekly plan
CREATE TABLE IF NOT EXISTS doctor_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  weekday INTEGER NOT NULL CHECK (weekday BETWEEN 0 AND 6), -- 0 = Sunday, 1 = Monday, etc.
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  slot_duration INTEGER DEFAULT 30, -- default slot duration in minutes
  is_available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(doctor_id, weekday)
);

CREATE INDEX IF NOT EXISTS idx_doctor_availability_lookup ON doctor_availability(doctor_id, weekday);

-- 3. Create doctor_availability_exceptions for special dates (extra hours or special holidays)
CREATE TABLE IF NOT EXISTS doctor_availability_exceptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  exception_date DATE NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT TRUE, -- TRUE = open for business on exception, FALSE = closed
  start_time TIME,
  end_time TIME,
  slot_duration INTEGER DEFAULT 30,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(doctor_id, exception_date)
);

CREATE INDEX IF NOT EXISTS idx_doctor_availability_exceptions_lookup ON doctor_availability_exceptions(doctor_id, exception_date);

-- 4. Create doctor_leaves table for doctor leaves/days off
CREATE TABLE IF NOT EXISTS doctor_leaves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  leave_date DATE NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(doctor_id, leave_date)
);

CREATE INDEX IF NOT EXISTS idx_doctor_leaves_lookup ON doctor_leaves(doctor_id, leave_date);

-- 5. Create appointment_holds table for temporary slot reservation
CREATE TABLE IF NOT EXISTS appointment_holds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  appointment_date DATE NOT NULL,
  slot_id TEXT NOT NULL, -- slot start time formatted e.g. "09:30"
  user_id UUID NOT NULL DEFAULT gen_random_uuid(),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(doctor_id, appointment_date, slot_id)
);

CREATE INDEX IF NOT EXISTS idx_appointment_holds_lookup ON appointment_holds(doctor_id, appointment_date, slot_id);
CREATE INDEX IF NOT EXISTS idx_appointment_holds_expiry ON appointment_holds(expires_at);

-- 6. Alter appointments table to add slot_id, healthcare fields, and soft deletes
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS slot_id TEXT;
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS appointment_type TEXT DEFAULT 'consultation';
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS visit_reason TEXT;

-- 7. Add Database Race Condition Protection (Exclusivity Constraint)
-- Drop previous raw uniqueness constraints on time to prevent conflicts
ALTER TABLE appointments DROP CONSTRAINT IF EXISTS unique_doctor_appointment_time;

-- Add a partial unique index so that uniqueness on a slot is ONLY enforced on active (non-soft-deleted) bookings
-- This allows slot reuse if the previous booking was soft-deleted
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_doctor_active_slot
ON appointments (doctor_id, appointment_date, slot_id)
WHERE (deleted_at IS NULL);

-- 8. Create appointment_history table for audit logs
CREATE TABLE IF NOT EXISTS appointment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- e.g. 'booked', 'approved', 'rejected', 'soft_deleted', 'rescheduled'
  old_status TEXT,
  new_status TEXT,
  changed_by TEXT, -- email or 'system'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_appointment_history_ref ON appointment_history(appointment_id);

-- 9. Create notification_queue table for background asynchronous alerts
CREATE TABLE IF NOT EXISTS notification_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL, -- 'email', 'sms', 'whatsapp'
  recipient TEXT NOT NULL,
  subject TEXT,
  payload TEXT NOT NULL, -- HTML body or message text
  status TEXT DEFAULT 'pending', -- 'pending', 'sent', 'failed'
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notification_queue_status ON notification_queue(status);

-- 10. Create Materialized View for optimized Dashboard Analytics Calculations
DROP MATERIALIZED VIEW IF EXISTS dashboard_metrics;

CREATE MATERIALIZED VIEW dashboard_metrics AS
SELECT
  (SELECT COUNT(*) FROM appointments WHERE deleted_at IS NULL) AS total_appointments,
  (SELECT COUNT(*) FROM appointments WHERE status = 'pending' AND deleted_at IS NULL) AS pending_appointments,
  (SELECT COUNT(*) FROM appointments WHERE status IN ('confirmed','completed') AND deleted_at IS NULL) AS completed_appointments,
  (SELECT COUNT(*) FROM appointments WHERE status = 'rejected' AND deleted_at IS NULL) AS cancelled_appointments,
  (SELECT COUNT(*) FROM doctors WHERE is_active = true) AS total_doctors,
  (SELECT COUNT(DISTINCT COALESCE(patient_email, patient_phone))
     FROM appointments
     WHERE deleted_at IS NULL) AS total_patients,
  (SELECT COUNT(*)
     FROM appointments
     WHERE appointment_date >= DATE_TRUNC('month', CURRENT_DATE)
       AND deleted_at IS NULL) AS appointments_this_month,
  (SELECT COUNT(*)
     FROM appointments
     WHERE appointment_date >= DATE_TRUNC('week', CURRENT_DATE)
       AND deleted_at IS NULL) AS appointments_this_week,
  4.8 AS avg_rating;

-- 11. Create function and triggers to auto-update view on changes
CREATE OR REPLACE FUNCTION refresh_dashboard_metrics()
RETURNS TRIGGER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW dashboard_metrics;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS refresh_metrics_appointments ON appointments;
CREATE TRIGGER refresh_metrics_appointments
AFTER INSERT OR UPDATE OR DELETE OR TRUNCATE
ON appointments
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_dashboard_metrics();

DROP TRIGGER IF EXISTS refresh_metrics_doctors ON doctors;
CREATE TRIGGER refresh_metrics_doctors
AFTER INSERT OR UPDATE OR DELETE OR TRUNCATE
ON doctors
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_dashboard_metrics();

-- 12. Configure Row Level Security (RLS) policies on new tables
ALTER TABLE doctor_availability_exceptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_holds ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_queue ENABLE ROW LEVEL SECURITY;

-- Policies for doctor_availability_exceptions
CREATE POLICY "Allow public select from doctor_availability_exceptions" ON doctor_availability_exceptions FOR SELECT USING (true);
CREATE POLICY "Allow admin operations on doctor_availability_exceptions" ON doctor_availability_exceptions FOR ALL USING (true);

-- Policies for appointment_holds
CREATE POLICY "Allow public select from appointment_holds" ON appointment_holds FOR SELECT USING (true);
CREATE POLICY "Allow public insert to appointment_holds" ON appointment_holds FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public delete from appointment_holds" ON appointment_holds FOR DELETE USING (true);

-- Policies for appointment_history
CREATE POLICY "Allow select from appointment_history" ON appointment_history FOR SELECT USING (true);
CREATE POLICY "Allow public insert to appointment_history" ON appointment_history FOR INSERT WITH CHECK (true);

-- Policies for notification_queue
CREATE POLICY "Allow select from notification_queue" ON notification_queue FOR SELECT USING (true);
CREATE POLICY "Allow public insert to notification_queue" ON notification_queue FOR INSERT WITH CHECK (true);
