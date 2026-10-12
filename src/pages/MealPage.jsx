import { useState, useEffect, useMemo } from "react";
import MealStatsOverview from "../components/meals/MealStatsOverview";
import MealCard from "../components/meals/MealCard";
import AddMealModal from "../components/meals/AddMealModal";
import GroceryCard from "../components/dashboard/GroceryCard.jsx";

export default function MealsPage() {
    const [groceries, setGroceries] = useState([]);
    const [meals, setMeals] = useState([]);
    const [loading, setLoading] = useState(true);

    // Search & Inventory Selection State
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedGroceryIds, setSelectedGroceryIds] = useState(new Set());
    const [viewMode, setViewMode] = useState("grid");
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Load both Groceries & Meals
    const loadData = async () => {
        try {
            setLoading(true);
            const [gRes, mRes] = await Promise.all([
                fetch("/api/groceries"),
                fetch("/api/meals"),
            ]);
            if (gRes.ok) setGroceries(await gRes.json());
            if (mRes.ok) setMeals(await mRes.json());
        } catch (err) {
            console.error("Failed to load meals data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Selection handlers
    const toggleSelectGrocery = (id) => {
        setSelectedGroceryIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const selectAll = () => {
        setSelectedGroceryIds(new Set(groceries.map((g) => g.id)));
    };

    const clearSelection = () => {
        setSelectedGroceryIds(new Set());
    };

    // Recipe availability check
    const checkMealAvailability = (meal) => {
        const missingItems = [];
        for (const req of meal.ingredients) {
            const match = groceries.find(
                (g) => g.name.toLowerCase() === req.grocery_name.toLowerCase()
            );
            if (!match || Number(match.quantity) < Number(req.required_quantity)) {
                missingItems.push({
                    name: req.grocery_name,
                    required: req.required_quantity,
                    available: match ? match.quantity : 0,
                });
            }
        }
        return { canMake: missingItems.length === 0, missingItems };
    };

    // Save new meal
    const handleSaveMeal = async (mealPayload) => {
        const res = await fetch("/api/meals", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(mealPayload),
        });
        if (!res.ok) throw new Error("Failed to save meal");
        await loadData();
        clearSelection();
    };

    // Delete meal
    const handleDeleteMeal = async (id) => {
        await fetch(`/api/meals?id=${id}`, { method: "DELETE" });
        setMeals((prev) => prev.filter((m) => m.id !== id));
    };

    // Search filtered groceries
    const filteredGroceries = useMemo(() => {
        const q = searchQuery.toLowerCase().trim();
        if (!q) return groceries;
        return groceries.filter(
            (g) =>
                g.name.toLowerCase().includes(q) || g.category?.toLowerCase().includes(q)
        );
    }, [groceries, searchQuery]);

    const selectedGroceriesList = useMemo(() => {
        return groceries.filter((g) => selectedGroceryIds.has(g.id));
    }, [groceries, selectedGroceryIds]);

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {/* 1. Meals Overview Stats */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900 mb-1">Meals & Recipes</h1>
                <p className="text-sm text-slate-500 mb-4">
                    Group ingredients into meals and monitor whether you have enough stock to cook.
                </p>
                <MealStatsOverview
                    meals={meals}
                    checkMealAvailability={checkMealAvailability}
                />
            </div>

            {/* 2. Existing Meals Section */}
            {meals.length > 0 && (
                <div>
                    <h2 className="text-lg font-semibold text-slate-800 mb-3">Saved Meals</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {meals.map((meal) => (
                            <MealCard
                                key={meal.id}
                                meal={meal}
                                availability={checkMealAvailability(meal)}
                                onDelete={handleDeleteMeal}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* 3. Ingredient Selector Section */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-800">
                            Select Ingredients for a Meal
                        </h2>
                        <p className="text-xs text-slate-500">
                            Select items from your inventory to combine them into a meal recipe.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            disabled={selectedGroceryIds.size === 0}
                            onClick={() => setIsModalOpen(true)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
                        >
                            <span>+</span> Add Meal Item ({selectedGroceryIds.size})
                        </button>
                    </div>
                </div>

                {/* Toolbar: Search, Select All, View Toggle */}
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between mb-4">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search ingredients..."
                        className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm w-full sm:w-64 focus:outline-emerald-500"
                    />

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={selectAll}
                            className="text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg"
                        >
                            Select All
                        </button>
                        <button
                            type="button"
                            onClick={clearSelection}
                            className="text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg"
                        >
                            Clear
                        </button>
                        <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs">
                            <button
                                type="button"
                                onClick={() => setViewMode("grid")}
                                className={`px-2 py-1 rounded ${
                                    viewMode === "grid" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                                }`}
                            >
                                Grid
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewMode("table")}
                                className={`px-2 py-1 rounded ${
                                    viewMode === "table" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                                }`}
                            >
                                Table
                            </button>
                        </div>
                    </div>
                </div>

                {/* Interactive Selection List */}
                {viewMode === "grid" ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {filteredGroceries.map((item) => {
                            const isSelected = selectedGroceryIds.has(item.id);
                            return (
                                <div
                                    key={item.id}
                                    onClick={() => toggleSelectGrocery(item.id)}
                                    className={`cursor-pointer border-2 rounded-xl transition-all relative ${
                                        isSelected
                                            ? "border-emerald-500 shadow-md ring-2 ring-emerald-100"
                                            : "border-transparent hover:border-slate-300"
                                    }`}
                                >
                                    <div className="absolute top-3 right-3 z-10">
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => {}}
                                            className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 pointer-events-none"
                                        />
                                    </div>
                                    <GroceryCard
                                        item={item}
                                        onDelete={() => {}}
                                        onUpdateQuantity={() => {}}
                                        onUpdateItem={() => {}}
                                    />
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500">
                            <tr>
                                <th className="px-4 py-3 w-10">Select</th>
                                <th className="px-4 py-3">Item Name</th>
                                <th className="px-4 py-3">Category</th>
                                <th className="px-4 py-3">In Stock</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                            {filteredGroceries.map((item) => {
                                const isSelected = selectedGroceryIds.has(item.id);
                                return (
                                    <tr
                                        key={item.id}
                                        onClick={() => toggleSelectGrocery(item.id)}
                                        className={`cursor-pointer transition-colors ${
                                            isSelected ? "bg-emerald-50/70" : "hover:bg-slate-50"
                                        }`}
                                    >
                                        <td className="px-4 py-3">
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => {}}
                                                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 pointer-events-none"
                                            />
                                        </td>
                                        <td className="px-4 py-3 font-medium text-slate-900">{item.name}</td>
                                        <td className="px-4 py-3">{item.category}</td>
                                        <td className="px-4 py-3 font-semibold text-slate-800">
                                            {item.quantity} {item.unit}
                                        </td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal Dialog */}
            <AddMealModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                selectedGroceries={selectedGroceriesList}
                onSaveMeal={handleSaveMeal}
            />
        </div>
    );
}