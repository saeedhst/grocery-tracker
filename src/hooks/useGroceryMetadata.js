// src/hooks/useGroceryMetadata.js
import { useMemo } from "react";
import { DEFAULT_LOCATIONS, DEFAULT_CATEGORIES, QUANTITY_UNITS } from "../../constants/groceryConfig.js";

export function useGroceryMetadata(groceries = []) {
    // Merge and deduplicate locations from defaults + active database records
    const dynamicLocations = useMemo(() => {
        const itemLocations = groceries
            .map((item) => item.location?.trim())
            .filter(Boolean);
        return Array.from(new Set([...DEFAULT_LOCATIONS, ...itemLocations])).sort();
    }, [groceries]);

    // Merge and deduplicate categories from defaults + active database records
    const dynamicCategories = useMemo(() => {
        const itemCategories = groceries
            .map((item) => item.category?.trim())
            .filter(Boolean);
        return Array.from(new Set([...DEFAULT_CATEGORIES, ...itemCategories])).sort();
    }, [groceries]);

    return {
        locations: dynamicLocations,
        categories: dynamicCategories,
        units: QUANTITY_UNITS,
    };
}