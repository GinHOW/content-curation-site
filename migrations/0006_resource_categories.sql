ALTER TABLE resource_submissions ADD COLUMN resource_category TEXT;

CREATE INDEX IF NOT EXISTS idx_resource_submissions_category_status
  ON resource_submissions(type, resource_category, status, created_at DESC);
