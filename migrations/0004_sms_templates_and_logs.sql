-- Production-Grade SMS Templates Configuration and Delivery Audit Trail

-- 1. Create sms_templates table
CREATE TABLE IF NOT EXISTS sms_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name TEXT NOT NULL UNIQUE,
  template_id TEXT NOT NULL,
  sender_id TEXT NOT NULL DEFAULT 'TICARE',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed default template configurations (Fast2SMS DLT)
INSERT INTO sms_templates (template_name, template_id, sender_id)
VALUES 
  ('appointment_confirm', '123456', 'TICARE'),
  ('appointment_reminder_24h', '123457', 'TICARE'),
  ('appointment_reminder_1h', '123457', 'TICARE'),
  ('appointment_cancel', '123458', 'TICARE'),
  ('appointment_reschedule', '123459', 'TICARE')
ON CONFLICT (template_name) DO UPDATE 
SET template_id = EXCLUDED.template_id, sender_id = EXCLUDED.sender_id;

-- 2. Create sms_logs table
CREATE TABLE IF NOT EXISTS sms_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  mobile TEXT NOT NULL,
  template_name TEXT NOT NULL,
  fast2sms_request_id TEXT,
  status TEXT NOT NULL, -- e.g. 'sent', 'mock_sent', 'failed'
  response TEXT, -- JSON payload or error message from Fast2SMS
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sms_logs_mobile ON sms_logs(mobile);
CREATE INDEX IF NOT EXISTS idx_sms_logs_created_at ON sms_logs(created_at DESC);

-- Configure Row Level Security (RLS) policies
ALTER TABLE sms_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public select from sms_templates" ON sms_templates FOR SELECT USING (true);
CREATE POLICY "Allow admin operations on sms_templates" ON sms_templates FOR ALL USING (true);

CREATE POLICY "Allow public insert to sms_logs" ON sms_logs FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow select from sms_logs" ON sms_logs FOR SELECT USING (true);
