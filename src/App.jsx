import { useState, useEffect, useMemo } from "react";
import GroceryCard from "./components/GroceryCard";
import AddItemForm from "./components/AddItemForm";
import FilterBar from "./components/FilterBar";

export default function App() {
    const [groceries, setGroceries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filter & Sort State
    const [selectedLocation, setSelectedLocation] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("expiryAsc");

    // 1. Fetch live groceries from Cloudflare D1
    useEffect(() => {
        async function loadGroceries() {
            try {
                setLoading(true);
                const res = await fetch("/api/groceries");
                if (!res.ok) {
                    throw new Error(`Failed to load groceries: ${res.statusText}`);
                }
                const data = await res.json();
                setGroceries(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }

        loadGroceries();
    }, []);

    // 2. Add Item Handler
    const handleAddItem = (newItem) => {
        setGroceries((prev) => [newItem, ...prev]);
    };

    // 3. Delete Item Handler
    const handleDeleteItem = async (id) => {
        try {
            const res = await fetch(`/api/groceries?id=${id}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                throw new Error("Failed to delete item from database");
            }

            setGroceries((prev) => prev.filter((item) => item.id !== id));
        } catch (err) {
            alert(err.message);
        }
    };

    // 4. Compute Filtered & Sorted Items
    const filteredAndSortedGroceries = useMemo(() => {
        return groceries
            .filter((item) => {
                // Location filter
                const matchesLocation =
                    selectedLocation === "All" || item.location === selectedLocation;

                // Search query filter (matches name or category)
                const q = searchQuery.toLowerCase().trim();
                const matchesSearch =
                    !q ||
                    item.name.toLowerCase().includes(q) ||
                    item.category.toLowerCase().includes(q);

                return matchesLocation && matchesSearch;
            })
            .sort((a, b) => {
                if (sortBy === "nameAsc") {
                    return a.name.localeCompare(b.name);
                }
                if (sortBy === "quantityDesc") {
                    return Number(b.quantity) - Number(a.quantity);
                }
                if (sortBy === "expiryDesc") {
                    return (b.expiryDate || "").localeCompare(a.expiryDate || "");
                }
                // Default: expiryAsc (earliest expiry first; empty dates at the end)
                if (!a.expiryDate) return 1;
                if (!b.expiryDate) return -1;
                return a.expiryDate.localeCompare(b.expiryDate);
            });
    }, [groceries, selectedLocation, searchQuery, sortBy]);

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-10">
            <header className="max-w-6xl mx-auto mb-8">
                <h1 className="text-3xl font-bold text-slate-900">
                    Home Grocery Management
                </h1>
                <p className="text-slate-500 text-sm mt-1">
                    Keep track of pantry, fridge, and freezer inventory.
                </p>
            </header>

            <main className="max-w-6xl mx-auto">
                {/* Add Item Form */}
                <AddItemForm onAddItem={handleAddItem} />

                {/* Filter and Sort Toolbar */}
                <FilterBar
                    selectedLocation={selectedLocation}
                    onSelectLocation={setSelectedLocation}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    sortBy={sortBy}
                    onSortChange={setSortBy}
                />

                {/* Status Indicators */}
                {loading && (
                    <div className="text-center py-12 text-slate-500">
                        Loading your groceries from the cloud...
                    </div>
                )}

                {error && (
                    <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 mb-6">
                        Error: {error}
                    </div>
                )}

                {/* Empty State */}
                {!loading && !error && filteredAndSortedGroceries.length === 0 && (
                    <p className="text-center text-slate-500 py-12">
                        {groceries.length === 0
                            ? "Your inventory is empty. Add your first item above!"
                            : "No items match your search or filter criteria."}
                    </p>
                )}

                {/* Groceries Grid */}
                {!loading && !error && filteredAndSortedGroceries.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {filteredAndSortedGroceries.map((item) => (
                            <GroceryCard
                                key={item.id}
                                item={item}
                                onDelete={handleDeleteItem}
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}