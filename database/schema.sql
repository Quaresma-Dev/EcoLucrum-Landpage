CREATE TABLE IF NOT EXISTS reward_feedback (
  visitor_id TEXT PRIMARY KEY NOT NULL,
  choice TEXT NOT NULL CHECK (choice IN ('compras', 'cashback', 'produtos', 'experiencias')),
  created_at INTEGER NOT NULL
);
