-- 1. Add retry fields to notification_queue
ALTER TABLE notification_queue ADD COLUMN IF NOT EXISTS retry_count INTEGER DEFAULT 0;
ALTER TABLE notification_queue ADD COLUMN IF NOT EXISTS next_retry_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE notification_queue ADD COLUMN IF NOT EXISTS last_error TEXT;

-- 2. Add analytics fields to sms_logs
ALTER TABLE sms_logs ADD COLUMN IF NOT EXISTS sms_credits_used NUMERIC DEFAULT 0;
ALTER TABLE sms_logs ADD COLUMN IF NOT EXISTS sms_rate NUMERIC DEFAULT 0.20; -- default standard rate
ALTER TABLE sms_logs ADD COLUMN IF NOT EXISTS provider_response JSONB;

-- 3. Seed new recommended DLT templates into sms_templates
INSERT INTO sms_templates (template_name, template_id, sender_id)
VALUES 
  ('doctor_running_late', '123460', 'TICARE'),
  ('doctor_absent', '123461', 'TICARE'),
  ('payment_received', '123462', 'TICARE'),
  ('payment_failed', '123463', 'TICARE'),
  ('appointment_completed', '123464', 'TICARE')
ON CONFLICT (template_name) DO UPDATE 
SET template_id = EXCLUDED.template_id, sender_id = EXCLUDED.sender_id;
