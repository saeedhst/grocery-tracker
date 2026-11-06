import {useEffect, useState} from "react";
import ManageTaxonomyModal from "../modals/ManageTaxonomyModal.jsx";
import {searchProducts} from "../../services/supermarketApi";

export default function AddItemForm({onAddItem, locations, categories, units}) {
    const [isOpen, setIsOpen] = useState(false);
    const [activeModalType, setActiveModalType] = useState(null); // 'category' | 'location' | 'unit' | null

    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        category: categories[0] || "Pantry",
        quantity: 1,
        unit: units[0]?.value || "pcs",
        location: locations[0] || "Pantry",
        expiryDate: "",
    });

    useEffect(() => {
        const query = formData.name.trim();
        if (query.length < 2) {
            setSuggestions([]);
            return;
        }

        const timer = setTimeout(async () => {
            try {
                const res = await searchProducts(query, 5);
                // Support both { items: [...] } or direct array responses
                setSuggestions(Array.isArray(res) ? res : res.items || []);
            } catch (err) {
                console.error("Autocomplete error:", err);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [formData.name]);



    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData((prev) => ({...prev, [name]: value}));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name.trim()) return;

        try {
            setSubmitting(true);
            const res = await fetch("/api/groceries", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                throw new Error("Failed to create grocery item");
            }

            const newItem = await res.json();
            onAddItem(newItem);

            setFormData({
                name: "",
                category: categories[0] || "Pantry",
                quantity: 1,
                unit: units[0]?.value || "pcs",
                location: locations[0] || "Pantry",
                expiryDate: "",
            });
            setIsOpen(false);
        } catch (err) {
            alert(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    // Handle closing modal and auto-select newly added item
    const handleModalClose = (newlyAddedValue) => {
        if (newlyAddedValue) {
            if (activeModalType === "category") {
                setFormData((prev) => ({...prev, category: newlyAddedValue}));
            } else if (activeModalType === "location") {
                setFormData((prev) => ({...prev, location: newlyAddedValue}));
            } else if (activeModalType === "unit") {
                setFormData((prev) => ({...prev, unit: newlyAddedValue}));
            }
        }
        setActiveModalType(null);
    };

    return (
        <>
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
                            {/* Item Name */}
                            {/*<div>*/}
                            {/*    <label className="block text-xs font-medium text-slate-600 mb-1">*/}
                            {/*        Item Name*/}
                            {/*    </label>*/}
                            {/*    <input*/}
                            {/*        type="text"*/}
                            {/*        name="name"*/}
                            {/*        required*/}
                            {/*        value={formData.name}*/}
                            {/*        onChange={handleChange}*/}
                            {/*        placeholder="e.g. Greek Yogurt"*/}
                            {/*        className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-emerald-500"*/}
                            {/*    />*/}
                            {/*</div>*/}

                            {/* Item Name with Supermarket Autocomplete */}
                            <div className="relative">
                                <label className="block text-xs font-medium text-slate-600 mb-1">
                                    Item Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    required
                                    value={formData.name}
                                    onFocus={() => setShowSuggestions(true)}
                                    onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                                    onChange={handleChange}
                                    placeholder="e.g. Calvé Pindakaas"
                                    className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-emerald-500"
                                />

                                {showSuggestions && suggestions.length > 0 && (
                                    <ul className="absolute z-30 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-48 overflow-y-auto divide-y divide-slate-100">
                                        {suggestions.map((prod) => (
                                            <li
                                                key={prod.id || prod.title}
                                                onMouseDown={() => {
                                                    setFormData((prev) => ({
                                                        ...prev,
                                                        name: prod.title || prod.name,
                                                    }));
                                                    setShowSuggestions(false);
                                                }}
                                                className="px-3 py-2 text-xs hover:bg-emerald-50 cursor-pointer flex items-center justify-between"
                                            >
          <span className="font-medium text-slate-800 truncate">
            {prod.title || prod.name}
          </span>
                                                {prod.price?.current && (
                                                    <span className="text-slate-500 font-semibold ml-2">
              €{Number(prod.price.current).toFixed(2)}
            </span>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            {/* Category + Manage Shortcut */}
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">
                                    Category
                                </label>
                                <div className="flex gap-1.5">
                                    <select
                                        name="category"
                                        value={formData.category}
                                        onChange={handleChange}
                                        className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-emerald-500 bg-white"
                                    >
                                        {categories.map((cat) => (
                                            <option key={cat} value={cat}>
                                                {cat}
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                        type="button"
                                        onClick={() => setActiveModalType("category")}
                                        className="px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-sm border border-slate-200 transition-colors"
                                        title="Add or manage categories"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            {/* Location + Manage Shortcut */}
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">
                                    Storage Location
                                </label>
                                <div className="flex gap-1.5">
                                    <select
                                        name="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-emerald-500 bg-white"
                                    >
                                        {locations.map((loc) => (
                                            <option key={loc} value={loc}>
                                                {loc}
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                        type="button"
                                        onClick={() => setActiveModalType("location")}
                                        className="px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-sm border border-slate-200 transition-colors"
                                        title="Add or manage locations"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            {/* Quantity and Unit + Manage Shortcut */}
                            <div className="flex gap-2">
                                <div className="w-1/2">
                                    <label className="block text-xs font-medium text-slate-600 mb-1">
                                        Quantity
                                    </label>
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
                                    <label className="block text-xs font-medium text-slate-600 mb-1">
                                        Unit
                                    </label>
                                    <div className="flex gap-1.5">
                                        <select
                                            name="unit"
                                            value={formData.unit}
                                            onChange={handleChange}
                                            className="w-full border border-slate-200 rounded-lg p-2 text-sm focus:outline-emerald-500 bg-white"
                                        >
                                            {units.map((u) => (
                                                <option key={u.value} value={u.value}>
                                                    {u.label}
                                                </option>
                                            ))}
                                        </select>
                                        <button
                                            type="button"
                                            onClick={() => setActiveModalType("unit")}
                                            className="px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-sm border border-slate-200 transition-colors"
                                            title="Add or manage units"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Expiry Date */}
                            <div>
                                <label className="block text-xs font-medium text-slate-600 mb-1">
                                    Expiry Date
                                </label>
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

            {/* Modal Popup */}
            <ManageTaxonomyModal
                isOpen={Boolean(activeModalType)}
                type={activeModalType}
                onClose={handleModalClose}
            />
        </>
    );
}