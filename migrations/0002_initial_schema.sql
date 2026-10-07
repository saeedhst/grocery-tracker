-- 1. Locations Table
CREATE TABLE IF NOT EXISTS app_locations (
                                             id TEXT PRIMARY KEY,
                                             name TEXT UNIQUE NOT NULL,
                                             createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Seed default locations
INSERT OR IGNORE INTO app_locations (id, name) VALUES
  ('loc_1', 'Fridge'),
  ('loc_2', 'Pantry'),
  ('loc_3', 'Freezer');

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS app_categories (
                                              id TEXT PRIMARY KEY,
                                              name TEXT UNIQUE NOT NULL,
                                              createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Seed default categories
INSERT OR IGNORE INTO app_categories (id, name) VALUES
  ('cat_1', 'Dairy'),
  ('cat_2', 'Bakery'),
  ('cat_3', 'Produce'),
  ('cat_4', 'Meat'),
  ('cat_5', 'Pantry'),
  ('cat_6', 'Snacks'),
  ('cat_7', 'Beverages');

-- 3. Units Table
CREATE TABLE IF NOT EXISTS app_units (
                                         value TEXT PRIMARY KEY,
                                         label TEXT NOT NULL,
                                         createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Seed default units
INSERT OR IGNORE INTO app_units (value, label) VALUES
  ('pcs', 'Pieces (pcs)'),
  ('g', 'Grams (g)'),
  ('kg', 'Kilograms (kg)'),
  ('ml', 'Milliliters (ml)'),
  ('L', 'Liters (L)'),
  ('pack', 'Packs'),
  ('gallon', 'Gallons'),
  ('loaves', 'Loaves');