CREATE TABLE IF NOT EXISTS plan_rules (
  id TEXT PRIMARY KEY,
  activity_id TEXT NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  frequency TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT,
  interval INTEGER NOT NULL DEFAULT 1,
  weekdays TEXT,
  note TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS plan_exceptions (
  id TEXT PRIMARY KEY,
  plan_rule_id TEXT NOT NULL REFERENCES plan_rules(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  UNIQUE(plan_rule_id, date)
);

CREATE INDEX IF NOT EXISTS idx_plan_rules_activity ON plan_rules(activity_id);
CREATE INDEX IF NOT EXISTS idx_plan_exceptions_rule ON plan_exceptions(plan_rule_id);
