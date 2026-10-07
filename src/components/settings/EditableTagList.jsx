import { useState } from "react";

export default function EditableTagList({
                                            title,
                                            items,
                                            onAdd,
                                            onUpdate,
                                            onRemove,
                                            isUnitList = false,
                                        }) {
    const [newItemName, setNewItemName] = useState("");
    const [newUnitValue, setNewUnitValue] = useState("");
    const [editingKey, setEditingKey] = useState(null);
    const [editValue, setEditValue] = useState("");

    const handleAdd = (e) => {
        e.preventDefault();
        if (!newItemName.trim()) return;

        if (isUnitList) {
            onAdd(newItemName, newUnitValue || newItemName);
            setNewUnitValue("");
        } else {
            onAdd(newItemName);
        }
        setNewItemName("");
    };

    const startEdit = (key, initialText) => {
        setEditingKey(key);
        setEditValue(initialText);
    };

    const saveEdit = (originalKey) => {
        if (editValue.trim()) {
            if (isUnitList) {
                onUpdate(originalKey, editValue, originalKey);
            } else {
                onUpdate(originalKey, editValue);
            }
        }
        setEditingKey(null);
    };

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm mb-6">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">{title}</h2>

            {/* Add Form */}
            <form onSubmit={handleAdd} className="flex gap-2 mb-4">
                <input
                    type="text"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    placeholder={isUnitList ? "Unit label (e.g. Bottles)" : `Add new ${title.toLowerCase().slice(0, -1)}...`}
                    className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm flex-1 focus:outline-emerald-500"
                />
                {isUnitList && (
                    <input
                        type="text"
                        value={newUnitValue}
                        onChange={(e) => setNewUnitValue(e.target.value)}
                        placeholder="Short code (e.g. btl)"
                        className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm w-36 focus:outline-emerald-500"
                    />
                )}
                <button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-1.5 text-sm rounded-lg transition-colors"
                >
                    Add
                </button>
            </form>

            {/* Item List */}
            <div className="divide-y divide-slate-100">
                {items.map((item) => {
                    const key = isUnitList ? item.value : item;
                    const displayLabel = isUnitList ? `${item.label} (${item.value})` : item;
                    const isItemEditing = editingKey === key;

                    return (
                        <div key={key} className="py-2.5 flex items-center justify-between">
                            {isItemEditing ? (
                                <div className="flex items-center gap-2 flex-1 mr-4">
                                    <input
                                        type="text"
                                        value={editValue}
                                        onChange={(e) => setEditValue(e.target.value)}
                                        className="border border-slate-300 rounded px-2 py-1 text-sm flex-1 focus:outline-emerald-500"
                                        autoFocus
                                    />
                                    <button
                                        type="button"
                                        onClick={() => saveEdit(key)}
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
                                <span className="text-sm font-medium text-slate-700">{displayLabel}</span>
                            )}

                            {!isItemEditing && (
                                <div className="flex items-center gap-1">
                                    <button
                                        type="button"
                                        onClick={() => startEdit(key, isUnitList ? item.label : item)}
                                        className="text-slate-400 hover:text-emerald-600 p-1"
                                        title="Edit"
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onRemove(key)}
                                        className="text-slate-400 hover:text-rose-600 p-1"
                                        title="Delete"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}