-- Grant schema usage to roles
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- Grant permissions on all existing tables, sequences and functions in public schema
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;

-- Alter default privileges for future tables, sequences and functions
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon, authenticated, service_role;

-- Explicitly grant SELECT on dashboard_metrics view
GRANT SELECT ON public.dashboard_metrics TO anon, authenticated, service_role;
