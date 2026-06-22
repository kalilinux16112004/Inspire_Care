-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
  patient_name TEXT,
  author TEXT,
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  review TEXT,
  comment TEXT,
  is_approved BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Allow public select
CREATE POLICY "Allow public select from reviews" ON reviews FOR SELECT USING (true);

-- Allow public insert
CREATE POLICY "Allow public insert to reviews" ON reviews FOR INSERT WITH CHECK (true);

-- Recreate dashboard_metrics materialized view to dynamically calculate average rating
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
  (SELECT COALESCE(ROUND(AVG(rating)::numeric, 1), 4.8) FROM reviews) AS avg_rating;

-- Add trigger to refresh metrics on reviews change
DROP TRIGGER IF EXISTS refresh_metrics_reviews ON reviews;
CREATE TRIGGER refresh_metrics_reviews
AFTER INSERT OR UPDATE OR DELETE OR TRUNCATE
ON reviews
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_dashboard_metrics();
