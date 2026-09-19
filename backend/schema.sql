CREATE TABLE IF NOT EXISTS workspaces (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  open_tickets INTEGER NOT NULL DEFAULT 0,
  response_time TEXT NOT NULL DEFAULT '0m',
  satisfaction NUMERIC(5, 2) NOT NULL DEFAULT 0,
  resolved_tickets INTEGER NOT NULL DEFAULT 0,
  total_conversations INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS tickets (
  id BIGSERIAL PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  customer TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  status_text TEXT NOT NULL DEFAULT 'Open',
  channel TEXT NOT NULL DEFAULT 'Chat',
  time_label TEXT NOT NULL DEFAULT 'just now',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS tickets_workspace_created_idx ON tickets (workspace_id, created_at DESC);
CREATE INDEX IF NOT EXISTS tickets_workspace_status_idx ON tickets (workspace_id, status);
