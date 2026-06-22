 ALTER TABLE services
RENAME COLUMN title TO name;

ALTER TABLE services
ADD COLUMN image_url text;