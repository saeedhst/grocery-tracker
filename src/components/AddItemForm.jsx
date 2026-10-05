import { useState } from "react";

const LOCATIONS = ["Fridge", "Pantry", "Freezer"];
const CATEGORIES = ["Dairy", "Bakery", "Produce", "Meat", "Pantry", "Snacks", "Beverages"];

export default function AddItemForm({ onAddItem }) {
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        category: CATEGORIES[0],
        quantity: 1,
        unit: "pcs",
        location: LOCATIONS[0],
        expiryDate: "",
    });
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name.trim()) return;

        try {
            setSubmitting(true);
            const res = await fetch("/api/groceries", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                throw new Error("Failed to create grocery item");
            }

            const newItem = await res.json();
            onAddItem(newItem);

            // Reset form and close modal/drawer
            setFormData({
                name: "",
                category: CATEGORIES[0],
                quantity: 1,
                unit: "pcs",
                location: LOCATIONS[0],
                expiryDate: "",
            });
            setIsOpen(false);
        } catch (err) {
            alert(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="mb-8">
            {!isOpen ? (
                <button
                    type="button"
                    onClick={() => setIsOpen(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                >
                    <span>+</span> Add Grocery Item
                </button>
            ) : (
                <form
                    onSubmit={handleSubmit}
                    className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm"
                >
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold text-slate-800">Add New Item</h2>
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="text-slate-400 hover:text-slate-600 text-sm"
                        >
                            Cancel
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Item Name</label>
                            <input
                                type="text"
                                name="name"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="e.g. Greek Yogurt"
                                className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-emerald-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Category</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-emerald-500"
                            >
                                {CATEGORIES.map((cat) => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Storage Location</label>
                            <select
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-emerald-500"
                            >
                                {LOCATIONS.map((loc) => (
                                    <option key={loc} value={loc}>{loc}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex gap-2">
                            <div className="w-1/2">
                                <label className="block text-xs font-medium text-slate-600 mb-1">Quantity</label>
                                <input
                                    type="number"
                                    name="quantity"
                                    min="0.1"
                                    step="any"
                                    required
                                    value={formData.quantity}
                                    onChange={handleChange}
                                    className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-emerald-500"
                                />
                            </div>
                            <div className="w-1/2">
                                <label className="block text-xs font-medium text-slate-600 mb-1">Unit</label>
                                <input
                                    type="text"
                                    name="unit"
                                    value={formData.unit}
                                    onChange={handleChange}
                                    placeholder="pcs, kg, L"
                                    className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-emerald-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">Expiry Date</label>
                            <input
                                type="date"
                                name="expiryDate"
                                value={formData.expiryDate}
                                onChange={handleChange}
                                className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-emerald-500"
                            />
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors disabled:opacity-50"
                        >
                            {submitting ? "Saving..." : "Save Item"}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}