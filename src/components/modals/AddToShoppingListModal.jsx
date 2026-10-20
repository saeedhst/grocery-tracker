import { useState, useEffect } from "react";

export default function AddToShoppingListModal({ isOpen, onClose, groceryItem }) {
    const [lists, setLists] = useState([]);
    const [selectedListIds, setSelectedListIds] = useState(new Set());
    const [newListName, setNewListName] = useState("");
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!isOpen) return;
        async function loadLists() {
            try {
                setLoading(true);
                const res = await fetch("/api/shopping-lists");
                if (res.ok) {
                    const data = await res.json();
                    setLists(data);
                    // Default selection to the default list
                    const defaultList = data.find((l) => l.is_default);
                    if (defaultList) setSelectedListIds(new Set([defaultList.id]));
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        loadLists();
    }, [isOpen]);

    if (!isOpen || !groceryItem) return null;

    const toggleList = (id) => {
        setSelectedListIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const handleCreateList = async (e) => {
        e.preventDefault();
        if (!newListName.trim()) return;

        try {
            const res = await fetch("/api/shopping-lists", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "create_list", name: newListName.trim() }),
            });
            if (res.ok) {
                const newList = await res.json();
                setLists((prev) => [...prev, newList]);
                setSelectedListIds((prev) => new Set(prev).add(newList.id));
                setNewListName("");
            }
        } catch (err) {
            alert("Error creating list: " + err.message);
        }
    };

    const handleSave = async () => {
        if (selectedListIds.size === 0) return;
        try {
            setSaving(true);
            await fetch("/api/shopping-lists", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "add_item_to_lists",
                    item: {
                        name: groceryItem.name,
                        category: groceryItem.category,
                        quantity: 1,
                        unit: groceryItem.unit || "pcs",
                    },
                    listIds: Array.from(selectedListIds),
                }),
            });
            onClose();
        } catch (err) {
            alert("Error adding item to list: " + err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-sm overflow-hidden flex flex-col">
                {/* Header */}
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h3 className="font-semibold text-slate-800 text-sm">Save to Shopping List</h3>
                        <p className="text-xs text-slate-500 truncate max-w-[220px]">{groceryItem.name}</p>
                    </div>
                    <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1">
                        ✕
                    </button>
                </div>

                {/* Existing Lists Checkboxes */}
                <div className="p-4 overflow-y-auto max-h-56 space-y-2">
                    {loading ? (
                        <p className="text-xs text-slate-400 py-4 text-center">Loading lists...</p>
                    ) : (
                        lists.map((list) => {
                            const isChecked = selectedListIds.has(list.id);
                            return (
                                <label
                                    key={list.id}
                                    className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 cursor-pointer text-sm"
                                >
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={isChecked}
                                            onChange={() => toggleList(list.id)}
                                            className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                                        />
                                        <span className="text-slate-700 font-medium">{list.name}</span>
                                    </div>
                                    {list.is_default && (
                                        <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-semibold">
                      Default
                    </span>
                                    )}
                                </label>
                            );
                        })
                    )}
                </div>

                {/* Create New List Inline */}
                <form onSubmit={handleCreateList} className="px-4 py-2 border-t border-slate-100 flex gap-2">
                    <input
                        type="text"
                        value={newListName}
                        onChange={(e) => setNewListName(e.target.value)}
                        placeholder="+ New list name..."
                        className="flex-1 border border-slate-200 rounded-lg px-2.5 py-1 text-xs focus:outline-emerald-500"
                    />
                    <button
                        type="submit"
                        className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg font-medium"
                    >
                        Create
                    </button>
                </form>

                {/* Footer */}
                <div className="px-4 py-3 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving || selectedListIds.size === 0}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-1.5 text-xs rounded-lg transition-colors disabled:opacity-40"
                    >
                        {saving ? "Saving..." : "Save"}
                    </button>
                </div>
            </div>
        </div>
    );
}