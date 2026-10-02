const GroceryCard = ({item, onDelete}) => {

    return (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
                {/* Card Header: Item Name, Location Badge, & Delete Action */}
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

                {/* Card Body: Category and Quantity */}
                <p className="text-sm text-slate-500 mb-2">
                    Category: <span className="font-medium text-slate-700">{item.category}</span>
                </p>
                <p className="text-sm text-slate-600">
                    Quantity: <span className="font-semibold text-slate-900">{item.quantity} {item.unit}</span>
                </p>
            </div>

            {/* Card Footer: Expiration Date */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Expires:</span>
                <span className="font-medium text-slate-700">{item.expiryDate}</span>
            </div>
        </div>
    );
}

export default GroceryCard;