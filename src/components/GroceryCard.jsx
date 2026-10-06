import { useState } from "react";

const LOCATIONS = ["Fridge", "Pantry", "Freezer"];
const CATEGORIES = ["Dairy", "Bakery", "Produce", "Meat", "Pantry", "Snacks", "Beverages"];

export default function GroceryCard({ item, onDelete, onUpdateQuantity, onUpdateItem }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ ...item });
    const [saving, setSaving] = useState(false);

    const getExpiryBadge = (dateString) => {
        if (!dateString) return null;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const expDate = new Date(dateString);
        expDate.setHours(0, 0, 0, 0);

        const diffDays = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
            return (
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-red-100 text-red-700">
          Expired
        </span>
            );
        }
        if (diffDays === 0) {
            return (
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-red-100 text-red-700">
          Expires today
        </span>
            );
        }
        if (diffDays <= 3) {
            return (
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-amber-100 text-amber-800">
          Expires in {diffDays} {diffDays === 1 ? "day" : "days"}
        </span>
            );
        }
        return (
            <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-emerald-50 text-emerald-700">
        Fresh
      </span>
        );
    };

    const handleFieldChange = (e) => {
        const { name, value } = e.target;
        setEditForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleCancel = () => {
        setEditForm({ ...item });
        setIsEditing(false);
    };

    const handleSave = async () => {
        if (!editForm.name.trim()) return;
        try {
            setSaving(true);
            await onUpdateItem({
                ...editForm,
                quantity: Number(editForm.quantity) || 0,
            });
            setIsEditing(false);
        } catch (err) {
            alert(err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
                {/* Header Actions */}
                <div className="flex justify-between items-start mb-2">
                    {isEditing ? (
                        <div className="flex-1 mr-2">
                            <label className="text-[10px] uppercase font-bold text-slate-400">Name</label>
                            <input
                                type="text"
                                name="name"
                                value={editForm.name}
                                onChange={handleFieldChange}
                                className="w-full border border-slate-300 rounded px-2 py-1 text-sm font-semibold text-slate-800 focus:outline-emerald-500"
                            />
                        </div>
                    ) : (
                        <div>
                            <h3 className="font-semibold text-lg text-slate-800">{item.name}</h3>
                            <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full font-medium inline-block mt-1">
                {item.location}
              </span>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1">
                        {isEditing ? (
                            <>
                                {/* Accept / Save (Green Check) */}
                                <button
                                    type="button"
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="text-emerald-600 hover:text-emerald-700 bg-emerald-50 p-1.5 rounded-md transition-colors"
                                    title="Save changes"
                                    aria-label="Save changes"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                </button>

                                {/* Cancel (X button) */}
                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    disabled={saving}
                                    className="text-slate-400 hover:text-slate-600 bg-slate-100 p-1.5 rounded-md transition-colors"
                                    title="Cancel"
                                    aria-label="Cancel"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </>
                        ) : (
                            <>
                                {/* Edit Button (Pencil) behind the delete button */}
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(true)}
                                    className="text-slate-400 hover:text-emerald-600 transition-colors p-1"
                                    title="Edit item"
                                    aria-label="Edit item"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                                        />
                                    </svg>
                                </button>

                                {/* Delete Button */}
                                <button
                                    type="button"
                                    onClick={() => onDelete(item.id)}
                                    className="text-slate-400 hover:text-red-500 transition-colors p-1"
                                    title="Remove item"
                                    aria-label="Remove item"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                        />
                                    </svg>
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Card Body: Editing vs View Mode */}
                {isEditing ? (
                    <div className="space-y-2 mt-3 text-xs">
                        <div>
                            <label className="text-[10px] uppercase font-bold text-slate-400">Category</label>
                            <select
                                name="category"
                                value={editForm.category}
                                onChange={handleFieldChange}
                                className="w-full border border-slate-300 rounded p-1 text-slate-700 focus:outline-emerald-500"
                            >
                                {CATEGORIES.map((cat) => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="text-[10px] uppercase font-bold text-slate-400">Location</label>
                            <select
                                name="location"
                                value={editForm.location}
                                onChange={handleFieldChange}
                                className="w-full border border-slate-300 rounded p-1 text-slate-700 focus:outline-emerald-500"
                            >
                                {LOCATIONS.map((loc) => (
                                    <option key={loc} value={loc}>{loc}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex gap-2">
                            <div className="w-1/2">
                                <label className="text-[10px] uppercase font-bold text-slate-400">Quantity</label>
                                <input
                                    type="number"
                                    name="quantity"
                                    step="any"
                                    min="0"
                                    value={editForm.quantity}
                                    onChange={handleFieldChange}
                                    className="w-full border border-slate-300 rounded p-1 text-slate-700 focus:outline-emerald-500"
                                />
                            </div>
                            <div className="w-1/2">
                                <label className="text-[10px] uppercase font-bold text-slate-400">Unit</label>
                                <input
                                    type="text"
                                    name="unit"
                                    value={editForm.unit}
                                    onChange={handleFieldChange}
                                    className="w-full border border-slate-300 rounded p-1 text-slate-700 focus:outline-emerald-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-[10px] uppercase font-bold text-slate-400">Expiry Date</label>
                            <input
                                type="date"
                                name="expiryDate"
                                value={editForm.expiryDate || ""}
                                onChange={handleFieldChange}
                                className="w-full border border-slate-300 rounded p-1 text-slate-700 focus:outline-emerald-500"
                            />
                        </div>
                    </div>
                ) : (
                    <>
                        <p className="text-sm text-slate-500 mb-3">
                            Category: <span className="font-medium text-slate-700">{item.category}</span>
                        </p>

                        <div className="flex items-center justify-between bg-slate-50 p-2 rounded-lg border border-slate-100">
                            <span className="text-xs font-medium text-slate-500">Quantity</span>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => onUpdateQuantity(item.id, Math.max(0, Number(item.quantity) - 1))}
                                    className="w-6 h-6 rounded bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 flex items-center justify-center font-bold text-sm shadow-sm"
                                >
                                    -
                                </button>
                                <span className="text-sm font-semibold text-slate-800 min-w-12 text-center">
                  {item.quantity} {item.unit}
                </span>
                                <button
                                    type="button"
                                    onClick={() => onUpdateQuantity(item.id, Number(item.quantity) + 1)}
                                    className="w-6 h-6 rounded bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 flex items-center justify-center font-bold text-sm shadow-sm"
                                >
                                    +
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {!isEditing && (
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>{item.expiryDate ? `Exp: ${item.expiryDate}` : "No expiry date"}</span>
                    {getExpiryBadge(item.expiryDate)}
                </div>
            )}
        </div>
    );
}