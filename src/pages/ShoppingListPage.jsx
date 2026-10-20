import { useState, useEffect } from "react";

export default function ShoppingListsPage() {
    const [lists, setLists] = useState([]);
    const [activeListId, setActiveListId] = useState(null);
    const [newQuickItemName, setNewQuickItemName] = useState("");
    const [newListName, setNewListName] = useState("");
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/shopping-lists");
            if (res.ok) {
                const data = await res.json();
                setLists(data);
                if (!activeListId && data.length > 0) {
                    setActiveListId(data[0].id);
                }
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const activeList = lists.find((l) => l.id === activeListId) || lists[0];

    const handleToggleItem = async (itemId, currentChecked) => {
        // Optimistic UI update
        setLists((prev) =>
            prev.map((list) => ({
                ...list,
                items: list.items.map((item) =>
                    item.id === itemId ? { ...item, is_checked: !currentChecked } : item
                ),
            }))
        );

        await fetch("/api/shopping-lists", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ itemId, is_checked: !currentChecked }),
        });
    };

    const handleDeleteItem = async (itemId) => {
        setLists((prev) =>
            prev.map((list) => ({
                ...list,
                items: list.items.filter((item) => item.id !== itemId),
            }))
        );
        await fetch(`/api/shopping-lists?itemId=${itemId}`, { method: "DELETE" });
    };

    const handleAddQuickItem = async (e) => {
        e.preventDefault();
        if (!newQuickItemName.trim() || !activeList) return;

        await fetch("/api/shopping-lists", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                action: "add_item_to_lists",
                item: { name: newQuickItemName.trim(), quantity: 1, unit: "pcs" },
                listIds: [activeList.id],
            }),
        });
        setNewQuickItemName("");
        loadData();
    };

    const handleCreateList = async (e) => {
        e.preventDefault();
        if (!newListName.trim()) return;

        const res = await fetch("/api/shopping-lists", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "create_list", name: newListName.trim() }),
        });

        if (res.ok) {
            const created = await res.json();
            setLists((prev) => [...prev, created]);
            setActiveListId(created.id);
            setNewListName("");
        }
    };

    const handleDeleteList = async (listId) => {
        if (!confirm("Are you sure you want to delete this list?")) return;
        const res = await fetch(`/api/shopping-lists?listId=${listId}`, { method: "DELETE" });
        if (res.ok) {
            setLists((prev) => prev.filter((l) => l.id !== listId));
            setActiveListId(lists[0]?.id || null);
        } else {
            const err = await res.json();
            alert(err.error || "Cannot delete list");
        }
    };

    return (
        <div className="max-w-6xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">Shopping Lists</h1>
                <p className="text-sm text-slate-500">Manage groceries to purchase across your custom lists.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Left Sidebar: Lists Selector */}
                <div className="md:col-span-1 space-y-4">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                            Your Lists
                        </h2>
                        <div className="space-y-1">
                            {lists.map((list) => {
                                const isActive = list.id === activeListId;
                                return (
                                    <button
                                        key={list.id}
                                        type="button"
                                        onClick={() => setActiveListId(list.id)}
                                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                            isActive
                                                ? "bg-emerald-50 text-emerald-800 font-semibold"
                                                : "text-slate-600 hover:bg-slate-50"
                                        }`}
                                    >
                                        <span className="truncate">{list.name}</span>
                                        <span className="text-xs bg-slate-100 px-2 py-0.5 rounded-full text-slate-500">
                      {list.items?.length || 0}
                    </span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Create List Form */}
                        <form onSubmit={handleCreateList} className="mt-4 pt-3 border-t border-slate-100 flex gap-1.5">
                            <input
                                type="text"
                                value={newListName}
                                onChange={(e) => setNewListName(e.target.value)}
                                placeholder="+ New list..."
                                className="w-full border border-slate-200 rounded-lg px-2.5 py-1 text-xs focus:outline-emerald-500"
                            />
                            <button
                                type="submit"
                                className="bg-emerald-600 text-white px-3 py-1 rounded-lg text-xs font-medium hover:bg-emerald-700"
                            >
                                Add
                            </button>
                        </form>
                    </div>
                </div>

                {/* Right Content: Active List Items */}
                <div className="md:col-span-3">
                    {activeList ? (
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                                <div className="flex items-center gap-2">
                                    <h2 className="text-xl font-bold text-slate-800">{activeList.name}</h2>
                                    {activeList.is_default && (
                                        <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-semibold">
                      Protected Default
                    </span>
                                    )}
                                </div>

                                {!activeList.is_default && (
                                    <button
                                        type="button"
                                        onClick={() => handleDeleteList(activeList.id)}
                                        className="text-xs text-rose-600 hover:text-rose-700 font-medium"
                                    >
                                        Delete List
                                    </button>
                                )}
                            </div>

                            {/* Add item directly */}
                            <form onSubmit={handleAddQuickItem} className="flex gap-2 mb-6">
                                <input
                                    type="text"
                                    value={newQuickItemName}
                                    onChange={(e) => setNewQuickItemName(e.target.value)}
                                    placeholder="Add item to this list (e.g. Olive Oil)..."
                                    className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-emerald-500"
                                />
                                <button
                                    type="submit"
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 text-sm rounded-lg transition-colors"
                                >
                                    Add
                                </button>
                            </form>

                            {/* Items List */}
                            {activeList.items?.length === 0 ? (
                                <p className="text-slate-400 text-sm py-8 text-center">
                                    No items in this list. Add some above or from your Dashboard!
                                </p>
                            ) : (
                                <div className="divide-y divide-slate-100">
                                    {activeList.items?.map((item) => (
                                        <div
                                            key={item.id}
                                            className="py-3 flex items-center justify-between hover:bg-slate-50 px-2 rounded-lg transition-colors"
                                        >
                                            <label className="flex items-center gap-3 cursor-pointer flex-1">
                                                <input
                                                    type="checkbox"
                                                    checked={item.is_checked}
                                                    onChange={() => handleToggleItem(item.id, item.is_checked)}
                                                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                                                />
                                                <span
                                                    className={`text-sm ${
                                                        item.is_checked ? "line-through text-slate-400 font-normal" : "text-slate-800 font-medium"
                                                    }`}
                                                >
                          {item.item_name}
                        </span>
                                                <span className="text-xs text-slate-400">
                          ({item.quantity} {item.unit})
                        </span>
                                            </label>

                                            <button
                                                type="button"
                                                onClick={() => handleDeleteItem(item.id)}
                                                className="text-slate-300 hover:text-rose-600 p-1 text-sm"
                                                title="Delete item"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-slate-400">Select or create a list to begin.</div>
                    )}
                </div>
            </div>
        </div>
    );
}