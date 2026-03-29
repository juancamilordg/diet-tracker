ALTER TABLE users ADD COLUMN timezone TEXT NOT NULL DEFAULT 'Europe/London';

-- Composite index for the hot query path (user_id + date filter)
CREATE INDEX IF NOT EXISTS idx_meals_user_date ON meals(user_id, (logged_at::date));
