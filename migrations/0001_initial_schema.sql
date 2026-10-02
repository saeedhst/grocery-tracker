DROP TABLE IF EXISTS groceries;

CREATE TABLE groceries
(
    id         TEXT PRIMARY KEY,
    name       TEXT NOT NULL,
    category   TEXT NOT NULL,
    quantity   REAL NOT NULL,
    unit       TEXT NOT NULL,
    location   TEXT NOT NULL,
    expiryDate TEXT NOT NULL,
    createdAt  DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO groceries (id, name, category, quantity, unit, location, expiryDate)
VALUES ('1', 'Whole Milk', 'Dairy', 1, 'gallon', 'Fridge', '2026-10-06'),
       ('2', 'Sourdough Bread', 'Bakery', 2, 'loaves', 'Pantry', '2026-10-04'),
       ('3', 'Chicken Breast', 'Meat', 500, 'g', 'Freezer', '2026-11-15');