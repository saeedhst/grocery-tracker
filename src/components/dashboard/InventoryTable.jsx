export default function InventoryTable({items, onDelete, onUpdateQuantity,}) {
    const getExpiryBadge = (dateString) => {
        if (!dateString) return <span className="text-slate-400 text-xs">No date</span>;

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
          Today
        </span>
            );
        }
        if (diffDays <= 3) {
            return (
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-amber-100 text-amber-800">
          In {diffDays}d
        </span>
            );
        }
        return (
            <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-emerald-50 text-emerald-700">
        Fresh
      </span>
        );
    };

    return (
        <div className="overflow-x-auto bg-white rounded-xl border border-slate-200 shadow-sm">
            <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500">
                <tr>
                    <th className="px-4 py-3">Item Name</th>
                    <th className="px-4 py-3">Location</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Quantity</th>
                    <th className="px-4 py-3">Expiration</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                {items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-medium text-slate-900">{item.name}</td>
                        <td className="px-4 py-3">
                <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full font-medium">
                  {item.location}
                </span>
                        </td>
                        <td className="px-4 py-3 text-slate-500">{item.category}</td>
                        <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5">
                                <button
                                    type="button"
                                    onClick={() => onUpdateQuantity(item.id, Math.max(0, Number(item.quantity) - 1))}
                                    className="w-5 h-5 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center text-xs font-bold"
                                >
                                    -
                                </button>
                                <span className="font-semibold text-slate-800 text-xs min-w-10 text-center">
                    {item.quantity} {item.unit}
                  </span>
                                <button
                                    type="button"
                                    onClick={() => onUpdateQuantity(item.id, Number(item.quantity) + 1)}
                                    className="w-5 h-5 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center text-xs font-bold"
                                >
                                    +
                                </button>
                            </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500">
                            {item.expiryDate || "—"}
                        </td>
                        <td className="px-4 py-3">{getExpiryBadge(item.expiryDate)}</td>
                        <td className="px-4 py-3 text-right">
                            <button
                                type="button"
                                onClick={() => onDelete(item.id)}
                                className="text-slate-400 hover:text-red-500 p-1 transition-colors"
                                title="Remove item"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}