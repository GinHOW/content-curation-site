ALTER TABLE users ADD COLUMN class_name TEXT;

CREATE INDEX IF NOT EXISTS idx_users_class ON users(class_name);
