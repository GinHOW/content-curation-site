CREATE TABLE IF NOT EXISTS resource_static_overrides (
  static_id TEXT PRIMARY KEY,
  featured_override INTEGER CHECK (featured_override IN (0, 1)),
  is_hidden INTEGER NOT NULL DEFAULT 0 CHECK (is_hidden IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_resource_static_overrides_hidden
  ON resource_static_overrides(is_hidden);
