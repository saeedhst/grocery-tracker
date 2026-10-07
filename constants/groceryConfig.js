// src/constants/groceryConfig.js

export const DEFAULT_LOCATIONS = ["Fridge", "Pantry", "Freezer"];

export const DEFAULT_CATEGORIES = [
    "Dairy",
    "Bakery",
    "Produce",
    "Meat",
    "Pantry",
    "Snacks",
    "Beverages",
];

export const QUANTITY_UNITS = [
    { value: "pcs", label: "Pieces (pcs)" },
    { value: "g", label: "Grams (g)" },
    { value: "kg", label: "Kilograms (kg)" },
    { value: "ml", label: "Milliliters (ml)" },
    { value: "L", label: "Liters (L)" },
    { value: "pack", label: "Packs" },
    { value: "gallon", label: "Gallons" },
    { value: "loaves", label: "Loaves" },
];

export const LOCATION_BADGE_STYLES = {
    Fridge: "bg-blue-50 text-blue-700 border-blue-200",
    Pantry: "bg-amber-50 text-amber-700 border-amber-200",
    Freezer: "bg-cyan-50 text-cyan-700 border-cyan-200",
    default: "bg-slate-100 text-slate-700 border-slate-200",
};