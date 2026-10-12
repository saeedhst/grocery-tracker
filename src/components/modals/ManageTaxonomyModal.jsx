import { useState } from "react";
import { useSettings } from "../../context/SettingsContext";

export default function ManageTaxonomyModal({ isOpen, onClose, type }) {
    const {
        locations,
        categories,
        units,
        addLocation,
        removeLocation,
        updateLocation,
        addCategory,
        removeCategory,
        updateCategory,
        addUnit,
        removeUnit,
        updateUnit,
    } = useSettings();

    const [newItemName, setNewItemName] = useState("");
    const [newUnitValue, setNewUnitValue] = useState("");
    const [editingKey, setEditingKey] = useState(null);
    const [editValue, setEditValue] = useState("");

    if (!isOpen) return null;

    const isUnit = type === "unit";
    const title =
        type === "location"
            ? "Manage Locations"
            : type === "category"
                ? "Manage Categories"
                : "Manage Units";

    const items = isUnit ? units : type === "location" ? locations : categories;

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newItemName.trim()) return;

        if (isUnit) {
            await addUnit(newItemName, newUnitValue || newItemName);
            setNewUnitValue("");
        } else if (type === "location") {
            await addLocation(newItemName);
        } else {
            await addCategory(newItemName);
        }
        setNewItemName("");
    };

    const handleSaveEdit = async (key) => {
        if (!editValue.trim()) return;
        if (isUnit) {
            await updateUnit(key, editValue);
        } else if (type === "location") {
            await updateLocation(key, editValue);
        } else {
            await updateCategory(key, editValue);
        }
        setEditingKey(null);
    };

    const handleDelete = async (key) => {
        if (isUnit) {
            await removeUnit(key);
        } else if (type === "location") {
            await removeLocation(key);
        } else {
            await removeCategory(key);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col max-h-[85vh]">
                {/* Header */}
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-semibold text-slate-800 text-base">{title}</h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
                    >
                        ✕
                    </button>
                </div>

                {/* Add Field */}
                <div className="p-5 border-b border-slate-100 bg-slate-50">
                    <form onSubmit={handleAdd} className="flex gap-2">
                        <input
                            type="text"
                            value={newItemName}
                            onChange={(e) => setNewItemName(e.target.value)}
                            placeholder={isUnit ? "Unit label (e.g. Bottles)" : "New item name..."}
                            className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm flex-1 bg-white focus:outline-emerald-500"
                            autoFocus
                        />
                        {isUnit && (
                            <input
                                type="text"
                                value={newUnitValue}
                                onChange={(e) => setNewUnitValue(e.target.value)}
                                placeholder="Code (btl)"
                                className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm w-24 bg-white focus:outline-emerald-500"
                            />
                        )}
                        <button
                            type="submit"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-3.5 py-1.5 text-sm rounded-lg transition-colors whitespace-nowrap"
                        >
                            Add
                        </button>
                    </form>
                </div>

                {/* Existing List */}
                <div className="p-5 overflow-y-auto divide-y divide-slate-100 flex-1">
                    {items.map((item) => {
                        const key = isUnit ? item.value : item;
                        const displayLabel = isUnit ? `${item.label} (${item.value})` : item;
                        const isEditing = editingKey === key;

                        return (
                            <div key={key} className="py-2 flex items-center justify-between gap-2">
                                {isEditing ? (
                                    <div className="flex items-center gap-2 flex-1">
                                        <input
                                            type="text"
                                            value={editValue}
                                            onChange={(e) => setEditValue(e.target.value)}
                                            className="border border-slate-300 rounded px-2 py-1 text-sm flex-1 focus:outline-emerald-500"
                                            autoFocus
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleSaveEdit(key)}
                                            className="text-xs bg-emerald-600 text-white px-2.5 py-1 rounded hover:bg-emerald-700"
                                        >
                                            Save
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setEditingKey(null)}
                                            className="text-xs text-slate-500 hover:text-slate-700 px-2 py-1"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                ) : (
                                    <>
                    <span className="text-sm font-medium text-slate-700 truncate">
                      {displayLabel}
                    </span>
                                        <div className="flex items-center gap-1">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setEditingKey(key);
                                                    setEditValue(isUnit ? item.label : item);
                                                }}
                                                className="text-slate-400 hover:text-emerald-600 p-1 text-sm"
                                                title="Edit"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(key)}
                                                className="text-slate-400 hover:text-rose-600 p-1 text-sm"
                                                title="Delete"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-1.5 text-xs font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-100"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
}