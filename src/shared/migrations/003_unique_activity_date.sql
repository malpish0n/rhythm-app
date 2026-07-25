DELETE FROM log_entries
WHERE id NOT IN (
  SELECT id FROM (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY activity_id, date ORDER BY created_at ASC) AS rn
    FROM log_entries
  ) WHERE rn = 1
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_log_entries_unique_activity_date ON log_entries(activity_id, date);
