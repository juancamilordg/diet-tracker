-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    telegram_id BIGINT UNIQUE,
    display_name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Goals table (one per user)
CREATE TABLE IF NOT EXISTS goals (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    daily_calories_target INTEGER DEFAULT 2400,
    protein_target_g REAL DEFAULT 180,
    carbs_target_g REAL DEFAULT 250,
    fat_target_g REAL DEFAULT 75,
    fiber_target_g REAL DEFAULT 30,
    water_target_ml INTEGER DEFAULT 3500,
    weight_kg REAL,
    height_cm REAL,
    age INTEGER,
    sex TEXT CHECK(sex IN ('male','female')),
    activity_level TEXT CHECK(activity_level IN ('sedentary','light','moderate','active','very_active')),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Meals table
CREATE TABLE IF NOT EXISTS meals (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    logged_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    meal_category TEXT CHECK(meal_category IN ('breakfast','lunch','dinner','snack')),
    description TEXT NOT NULL,
    calories REAL,
    protein_g REAL,
    carbs_g REAL,
    fat_g REAL,
    fiber_g REAL,
    sodium_mg REAL,
    photo_file_id TEXT,
    photo_url TEXT,
    input_method TEXT CHECK(input_method IN ('photo','text','manual','voice')),
    ai_raw_response TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Water log table
CREATE TABLE IF NOT EXISTS water_log (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    amount_ml INTEGER NOT NULL,
    logged_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Daily summary cache
CREATE TABLE IF NOT EXISTS daily_summary_cache (
    date DATE NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users(id),
    total_calories REAL,
    total_protein_g REAL,
    total_carbs_g REAL,
    total_fat_g REAL,
    total_fiber_g REAL,
    total_water_ml INTEGER,
    meal_count INTEGER,
    PRIMARY KEY (date, user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_meals_logged_at ON meals(logged_at);
CREATE INDEX IF NOT EXISTS idx_meals_user_id ON meals(user_id);
CREATE INDEX IF NOT EXISTS idx_water_log_logged_at ON water_log(logged_at);
CREATE INDEX IF NOT EXISTS idx_water_log_user_id ON water_log(user_id);

-- Insert default user and goals
INSERT INTO users (id, display_name) VALUES (1, 'You') ON CONFLICT DO NOTHING;
INSERT INTO goals (user_id) VALUES (1) ON CONFLICT DO NOTHING;
