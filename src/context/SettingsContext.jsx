import { createContext, useContext, useState, useEffect } from "react";
import {
    DEFAULT_LOCATIONS,
    DEFAULT_CATEGORIES,
    QUANTITY_UNITS,
} from "../constants/groceryConfig";

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
    const [locations, setLocations] = useState(DEFAULT_LOCATIONS);
    const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
    const [units, setUnits] = useState(QUANTITY_UNITS);
    const [loading, setLoading] = useState(true);

    // Load live settings from Cloudflare D1 on app start
    const fetchSettings = async () => {
        try {
            const res = await fetch("/api/settings");
            if (res.ok) {
                const data = await res.json();
                if (data.locations?.length) setLocations(data.locations);
                if (data.categories?.length) setCategories(data.categories);
                if (data.units?.length) setUnits(data.units);
            }
        } catch (err) {
            console.error("Error loading settings from D1:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    // Locations
    const addLocation = async (name) => {
        const trimmed = name.trim();
        if (!trimmed) return;
        setLocations((prev) => [...prev, trimmed].sort());
        await fetch("/api/settings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: "location", name: trimmed }),
        });
    };

    const removeLocation = async (name) => {
        setLocations((prev) => prev.filter((loc) => loc !== name));
        await fetch(`/api/settings?type=location&name=${encodeURIComponent(name)}`, {
            method: "DELETE",
        });
    };

    const updateLocation = async (oldName, newName) => {
        const trimmed = newName.trim();
        if (!trimmed || trimmed === oldName) return;
        setLocations((prev) => prev.map((loc) => (loc === oldName ? trimmed : loc)).sort());
        await fetch("/api/settings", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: "location", oldName, newName: trimmed }),
        });
    };

    // Categories
    const addCategory = async (name) => {
        const trimmed = name.trim();
        if (!trimmed) return;
        setCategories((prev) => [...prev, trimmed].sort());
        await fetch("/api/settings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: "category", name: trimmed }),
        });
    };

    const removeCategory = async (name) => {
        setCategories((prev) => prev.filter((cat) => cat !== name));
        await fetch(`/api/settings?type=category&name=${encodeURIComponent(name)}`, {
            method: "DELETE",
        });
    };

    const updateCategory = async (oldName, newName) => {
        const trimmed = newName.trim();
        if (!trimmed || trimmed === oldName) return;
        setCategories((prev) => prev.map((cat) => (cat === oldName ? trimmed : cat)).sort());
        await fetch("/api/settings", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: "category", oldName, newName: trimmed }),
        });
    };

    // Units
    const addUnit = async (label, value) => {
        const val = (value || label).trim().toLowerCase();
        const lbl = label.trim();
        if (!val) return;
        setUnits((prev) => [...prev, { label: lbl, value: val }]);
        await fetch("/api/settings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: "unit", label: lbl, value: val }),
        });
    };

    const removeUnit = async (value) => {
        setUnits((prev) => prev.filter((u) => u.value !== value));
        await fetch(`/api/settings?type=unit&value=${encodeURIComponent(value)}`, {
            method: "DELETE",
        });
    };

    const updateUnit = async (value, newLabel) => {
        setUnits((prev) =>
            prev.map((u) => (u.value === value ? { ...u, label: newLabel.trim() } : u))
        );
        await fetch("/api/settings", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: "unit", value, newLabel: newLabel.trim() }),
        });
    };

    return (
        <SettingsContext.Provider
            value={{
                locations,
                categories,
                units,
                loading,
                addLocation,
                removeLocation,
                updateLocation,
                addCategory,
                removeCategory,
                updateCategory,
                addUnit,
                removeUnit,
                updateUnit,
            }}
        >
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error("useSettings must be used within a SettingsProvider");
    }
    return context;
}