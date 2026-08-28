PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS resource_submissions (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('article', 'video', 'website', 'tool')),
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  normalized_url TEXT NOT NULL,
  content_overview TEXT NOT NULL,
  tags_json TEXT NOT NULL DEFAULT '[]',
  submitter_name TEXT,
  submission_source TEXT NOT NULL CHECK (submission_source IN ('visitor', 'student', 'teacher')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  is_featured INTEGER NOT NULL DEFAULT 0 CHECK (is_featured IN (0, 1)),
  source_ip_hash TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_resource_submissions_status_created
  ON resource_submissions(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_resource_submissions_type_status
  ON resource_submissions(type, status, created_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS idx_resource_submissions_active_url
  ON resource_submissions(normalized_url)
  WHERE status IN ('pending', 'approved');

CREATE INDEX IF NOT EXISTS idx_resource_submissions_rate
  ON resource_submissions(source_ip_hash, created_at);
