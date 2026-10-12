import { useState } from "react";

export default function AddMealModal({
                                         isOpen,
                                         onClose,
                                         selectedGroceries,
                                         onSaveMeal,
                                     }) {
    const [mealName, setMealName] = useState("");
    const [description, setDescription] = useState("");
    const [ingredientQuantities, setIngredientQuantities] = useState(() =>
        selectedGroceries.reduce((acc, item) => {
            acc[item.id] = { requiredQuantity: 1, unit: item.unit || "pcs" };
            return acc;
        }, {})
    );
    const [submitting, setSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleQtyChange = (id, val) => {
        setIngredientQuantities((prev) => ({
            ...prev,
            [id]: { ...prev[id], requiredQuantity: Math.max(0.1, Number(val) || 1) },
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!mealName.trim() || selectedGroceries.length === 0) return;

        try {
            setSubmitting(true);
            const ingredientsPayload = selectedGroceries.map((item) => ({
                name: item.name,
                requiredQuantity: ingredientQuantities[item.id]?.requiredQuantity || 1,
                unit: item.unit || "pcs",
            }));

            await onSaveMeal({
                name: mealName.trim(),
                description: description.trim(),
                ingredients: ingredientsPayload,
            });

            setMealName("");
            setDescription("");
            onClose();
        } catch (err) {
            alert(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-semibold text-slate-800 text-base">Create Meal Recipe</h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 p-1"
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-5 flex-1 overflow-y-auto space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                            Meal / Recipe Name
                        </label>
                        <input
                            type="text"
                            required
                            value={mealName}
                            onChange={(e) => setMealName(e.target.value)}
                            placeholder="e.g. Greek Salad, Omelette"
                            className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:outline-emerald-500"
                            autoFocus
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">
                            Description / Notes (Optional)
                        </label>
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="e.g. Quick 10-minute dinner"
                            className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:outline-emerald-500"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2">
                            Selected Ingredients ({selectedGroceries.length})
                        </label>
                        <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden">
                            {selectedGroceries.map((item) => (
                                <div
                                    key={item.id}
                                    className="p-3 bg-slate-50 flex items-center justify-between text-sm"
                                >
                                    <div>
                                        <span className="font-medium text-slate-800">{item.name}</span>
                                        <span className="text-xs text-slate-500 ml-2">
                      (In stock: {item.quantity} {item.unit})
                    </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-slate-500">Need:</span>
                                        <input
                                            type="number"
                                            step="any"
                                            min="0.1"
                                            value={ingredientQuantities[item.id]?.requiredQuantity ?? 1}
                                            onChange={(e) => handleQtyChange(item.id, e.target.value)}
                                            className="w-16 border border-slate-300 rounded px-2 py-1 text-xs text-right bg-white focus:outline-emerald-500"
                                        />
                                        <span className="text-xs text-slate-600 min-w-8">{item.unit}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 text-sm rounded-lg transition-colors disabled:opacity-50"
                        >
                            {submitting ? "Saving..." : "Save Meal"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}