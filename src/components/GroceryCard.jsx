export default function GroceryCard({ item, onDelete, onUpdateQuantity }) {
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

    const handleDecrement = () => {
        const newQty = Math.max(0, Number(item.quantity) - 1);
        onUpdateQuantity(item.id, newQty);
    };

    const handleIncrement = () => {
        const newQty = Number(item.quantity) + 1;
        onUpdateQuantity(item.id, newQty);
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h3 className="font-semibold text-lg text-slate-800">{item.name}</h3>
                        <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full font-medium inline-block mt-1">
              {item.location}
            </span>
                    </div>
                    <button
                        type="button"
                        onClick={() => onDelete(item.id)}
                        className="text-slate-400 hover:text-red-500 transition-colors p-1"
                        title="Remove item"
                        aria-label="Remove item"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                        </svg>
                    </button>
                </div>

                <p className="text-sm text-slate-500 mb-3">
                    Category: <span className="font-medium text-slate-700">{item.category}</span>
                </p>

                {/* Quantity and Stepper Controls */}
                <div className="flex items-center justify-between bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <span className="text-xs font-medium text-slate-500">Quantity</span>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handleDecrement}
                            className="w-6 h-6 rounded bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 flex items-center justify-center font-bold text-sm shadow-sm"
                            title="Decrease quantity"
                        >
                            -
                        </button>
                        <span className="text-sm font-semibold text-slate-800 min-w-12 text-center">
              {item.quantity} {item.unit}
            </span>
                        <button
                            type="button"
                            onClick={handleIncrement}
                            className="w-6 h-6 rounded bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 flex items-center justify-center font-bold text-sm shadow-sm"
                            title="Increase quantity"
                        >
                            +
                        </button>
                    </div>
                </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>{item.expiryDate ? `Exp: ${item.expiryDate}` : "No expiry date"}</span>
                {getExpiryBadge(item.expiryDate)}
            </div>
        </div>
    );
}