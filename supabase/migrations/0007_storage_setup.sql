-- Create gallery storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('gallery', 'gallery', true)
ON CONFLICT (id) DO NOTHING;

-- Enable policies on storage.objects for the gallery bucket
DROP POLICY IF EXISTS "Allow public select on gallery bucket" ON storage.objects;
CREATE POLICY "Allow public select on gallery bucket" ON storage.objects FOR SELECT TO public USING (bucket_id = 'gallery');

DROP POLICY IF EXISTS "Allow public insert on gallery bucket" ON storage.objects;
CREATE POLICY "Allow public insert on gallery bucket" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'gallery');

DROP POLICY IF EXISTS "Allow public update on gallery bucket" ON storage.objects;
CREATE POLICY "Allow public update on gallery bucket" ON storage.objects FOR UPDATE TO public USING (bucket_id = 'gallery');

DROP POLICY IF EXISTS "Allow public delete on gallery bucket" ON storage.objects;
CREATE POLICY "Allow public delete on gallery bucket" ON storage.objects FOR DELETE TO public USING (bucket_id = 'gallery');
