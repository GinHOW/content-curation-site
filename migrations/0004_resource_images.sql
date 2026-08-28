ALTER TABLE resource_submissions ADD COLUMN image_key TEXT;
ALTER TABLE resource_submissions ADD COLUMN image_content_type TEXT;

CREATE INDEX IF NOT EXISTS idx_resource_submissions_image_key
  ON resource_submissions(image_key);
