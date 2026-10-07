// src/pages/DashboardPage.jsx
import { useState, useEffect, useMemo } from "react";
import GroceryCard from "../components/GroceryCard";
import AddItemForm from "../components/AddItemForm";
import FilterBar from "../components/FilterBar";
import StatsOverview from "../components/StatsOverview";
import InventoryTable from "../components/InventoryTable";
import { useSettings } from "../context/SettingsContext";

export default function DashboardPage() {
    const [groceries, setGroceries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [selectedLocation, setSelectedLocation] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("expiryAsc");
    const [viewMode, setViewMode] = useState("grid");

    const { locations, categories, units } = useSettings();

    useEffect(() => {
        async function loadGroceries() {
            try {
                setLoading(true);
                const res = await fetch("/api/groceries");
                if (!res.ok) throw new Error(`Failed to load groceries: ${res.statusText}`);
                setGroceries(await res.json());
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        loadGroceries();
    }, []);

    const handleAddItem = (newItem) => setGroceries((prev) => [newItem, ...prev]);

    const handleDeleteItem = async (id) => {
        try {
            const res = await fetch(`/api/groceries?id=${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete item");
            setGroceries((prev) => prev.filter((item) => item.id !== id));
        } catch (err) {
            alert(err.message);
        }
    };

    const handleUpdateQuantity = async (id, newQuantity) => {
        setGroceries((prev) =>
            prev.map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item))
        );
        try {
            const res = await fetch("/api/groceries", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, quantity: newQuantity }),
            });
            if (!res.ok) throw new Error("Failed to update quantity");
        } catch (err) {
            alert(err.message);
        }
    };

    const handleUpdateItem = async (updatedItem) => {
        setGroceries((prev) =>
            prev.map((item) => (item.id === updatedItem.id ? updatedItem : item))
        );
        try {
            const res = await fetch("/api/groceries", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedItem),
            });
            if (!res.ok) throw new Error("Failed to save changes");
        } catch (err) {
            alert(err.message);
        }
    };

    const filteredAndSortedGroceries = useMemo(() => {
        return groceries
            .filter((item) => {
                const matchesLocation =
                    selectedLocation === "All" || item.location === selectedLocation;
                const q = searchQuery.toLowerCase().trim();
                const matchesSearch =
                    !q ||
                    item.name.toLowerCase().includes(q) ||
                    item.category.toLowerCase().includes(q);
                return matchesLocation && matchesSearch;
            })
            .sort((a, b) => {
                if (sortBy === "nameAsc") return a.name.localeCompare(b.name);
                if (sortBy === "quantityDesc") return Number(b.quantity) - Number(a.quantity);
                if (sortBy === "expiryDesc") return (b.expiryDate || "").localeCompare(a.expiryDate || "");
                if (!a.expiryDate) return 1;
                if (!b.expiryDate) return -1;
                return a.expiryDate.localeCompare(b.expiryDate);
            });
    }, [groceries, selectedLocation, searchQuery, sortBy]);

    return (
        <div className="max-w-6xl mx-auto">
            <StatsOverview groceries={groceries} />

            <AddItemForm
                onAddItem={handleAddItem}
                locations={locations}
                categories={categories}
                units={units}
            />

            <FilterBar
                locations={locations}
                selectedLocation={selectedLocation}
                onSelectLocation={setSelectedLocation}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                sortBy={sortBy}
                onSortChange={setSortBy}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
            />

            {loading && (
                <div className="text-center py-12 text-slate-500">Loading your groceries...</div>
            )}

            {error && (
                <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 mb-6">
                    Error: {error}
                </div>
            )}

            {!loading && !error && filteredAndSortedGroceries.length === 0 && (
                <p className="text-center text-slate-500 py-12">
                    {groceries.length === 0 ? "Inventory is empty." : "No matching items found."}
                </p>
            )}

            {!loading && !error && filteredAndSortedGroceries.length > 0 && (
                <>
                    {viewMode === "grid" ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {filteredAndSortedGroceries.map((item) => (
                                <GroceryCard
                                    key={item.id}
                                    item={item}
                                    locations={locations}
                                    categories={categories}
                                    units={units}
                                    onDelete={handleDeleteItem}
                                    onUpdateQuantity={handleUpdateQuantity}
                                    onUpdateItem={handleUpdateItem}
                                />
                            ))}
                        </div>
                    ) : (
                        <InventoryTable
                            items={filteredAndSortedGroceries}
                            onDelete={handleDeleteItem}
                            onUpdateQuantity={handleUpdateQuantity}
                        />
                    )}
                </>
            )}
        </div>
    );
}