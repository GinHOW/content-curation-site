PRAGMA foreign_keys = ON;

ALTER TABLE users ADD COLUMN failed_login_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN locked_until TEXT;
ALTER TABLE users ADD COLUMN last_login_at TEXT;

ALTER TABLE group_invites ADD COLUMN is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1));
ALTER TABLE group_invites ADD COLUMN use_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE group_invites ADD COLUMN updated_at TEXT;

UPDATE group_invites
SET updated_at = COALESCE(created_at, CURRENT_TIMESTAMP)
WHERE updated_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_group_invites_active_group
  ON group_invites(group_id)
  WHERE is_active = 1;

CREATE INDEX IF NOT EXISTS idx_users_status_lock
  ON users(status, locked_until);

CREATE INDEX IF NOT EXISTS idx_group_members_group
  ON group_members(group_id, joined_at);
