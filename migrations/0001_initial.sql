PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS rooms (
  id TEXT PRIMARY KEY,
  number TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS topics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  label TEXT NOT NULL,
  normalized_label TEXT NOT NULL UNIQUE,
  source TEXT NOT NULL DEFAULT 'system' CHECK (source IN ('system', 'custom')),
  room_id TEXT REFERENCES rooms(id) ON DELETE SET NULL,
  color_token TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_topics_room_active ON topics(room_id, is_active, sort_order);

CREATE TABLE IF NOT EXISTS course_groups (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS topic_assignments (
  group_id TEXT PRIMARY KEY REFERENCES course_groups(id) ON DELETE CASCADE,
  topic_id INTEGER NOT NULL UNIQUE REFERENCES topics(id) ON DELETE RESTRICT,
  assigned_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  password_hash TEXT,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'teacher', 'admin')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
  must_change_password INTEGER NOT NULL DEFAULT 1 CHECK (must_change_password IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS group_members (
  group_id TEXT NOT NULL REFERENCES course_groups(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  joined_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (group_id, user_id)
);

CREATE TABLE IF NOT EXISTS group_invites (
  id TEXT PRIMARY KEY,
  group_id TEXT NOT NULL REFERENCES course_groups(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  expires_at TEXT,
  used_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  kind TEXT NOT NULL CHECK (kind IN ('admin', 'student')),
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token_hash, kind, expires_at);

INSERT OR IGNORE INTO rooms (id, number, name, sort_order) VALUES
  ('room1', '01', '空间 01', 1),
  ('room2', '02', '空间 02', 2),
  ('room3', '03', '空间 03', 3),
  ('room4', '04', '空间 04', 4),
  ('room5', '05', '空间 05', 5),
  ('room6', '06', '空间 06', 6),
  ('room7', '07', '空间 07', 7),
  ('room8', '08', '空间 08', 8),
  ('room9', '09', '空间 09', 9),
  ('room10', '10', '空间 10', 10),
  ('room11', '11', '空间 11', 11),
  ('room12', '12', '空间 12', 12);

INSERT OR IGNORE INTO topics (label, normalized_label, source, room_id, color_token, sort_order) VALUES
  ('客厅', '客厅', 'system', 'room1', 'var(--home-spot-03)', 1),
  ('橱窗', '橱窗', 'system', 'room2', 'var(--home-spot-02)', 2),
  ('隧道', '隧道', 'system', 'room2', 'var(--home-spot-14)', 3),
  ('桌面', '桌面', 'system', 'room3', 'var(--home-spot-01)', 4),
  ('暗房', '暗房', 'system', 'room4', 'var(--home-spot-04)', 5),
  ('蓄水池', '蓄水池', 'system', 'room5', 'var(--home-spot-05)', 6),
  ('田', '田', 'system', 'room6', 'var(--home-spot-07)', 7),
  ('黄页', '黄页', 'system', 'room7', 'var(--home-spot-06)', 8),
  ('晒场', '晒场', 'system', 'room8', 'var(--home-spot-08)', 9),
  ('阳台', '阳台', 'system', 'room9', 'var(--home-spot-09)', 10),
  ('宴席', '宴席', 'system', 'room10', 'var(--home-spot-10)', 11),
  ('谷仓', '谷仓', 'system', 'room11', 'var(--home-spot-11)', 12),
  ('楼梯间', '楼梯间', 'system', 'room11', 'var(--home-spot-12)', 13),
  ('监控室', '监控室', 'system', 'room12', 'var(--home-spot-13)', 14);

INSERT OR IGNORE INTO course_groups (id, code, sort_order) VALUES
  ('group-a1', 'A1', 1), ('group-a2', 'A2', 2), ('group-a3', 'A3', 3), ('group-a4', 'A4', 4),
  ('group-a5', 'A5', 5), ('group-a6', 'A6', 6), ('group-a7', 'A7', 7), ('group-a8', 'A8', 8),
  ('group-b1', 'B1', 9), ('group-b2', 'B2', 10), ('group-b3', 'B3', 11), ('group-b4', 'B4', 12),
  ('group-b5', 'B5', 13), ('group-b6', 'B6', 14), ('group-b7', 'B7', 15), ('group-b8', 'B8', 16);
