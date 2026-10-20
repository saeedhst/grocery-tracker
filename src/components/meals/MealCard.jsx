export default function MealCard({ meal, availability, onDelete }) {
    // Support both server-enriched meal objects and client-computed availability
    const canMake = meal.canMake !== undefined ? meal.canMake : availability?.canMake;
    const missingCount = meal.ingredients
        ? meal.ingredients.filter((ing) => ing.isMissing).length
        : availability?.missingItems?.length || 0;

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
                {/* Card Header: Title, Description, and Delete Button */}
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h3 className="font-semibold text-lg text-slate-900">{meal.name}</h3>
                        {meal.description && (
                            <p className="text-xs text-slate-500 mt-0.5">{meal.description}</p>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={() => onDelete(meal.id)}
                        className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                        title="Delete meal"
                        aria-label="Delete meal"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                        </svg>
                    </button>
                </div>

                {/* Readiness Status Badge */}
                <div className="mb-4">
                    {canMake ? (
                        <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-emerald-100 text-emerald-800 inline-flex items-center gap-1">
              <span>●</span> Ready to cook
            </span>
                    ) : (
                        <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-rose-100 text-rose-800 inline-flex items-center gap-1">
              <span>●</span> Missing {missingCount} ingredient(s)
            </span>
                    )}
                </div>

                {/* Ingredients & Quantities Breakdown */}
                <div className="space-y-2 border-t border-slate-100 pt-3">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                        Ingredients & Inventory:
                    </p>

                    {meal.ingredients.map((ing, idx) => {
                        const ingName = ing.name || ing.grocery_name;
                        const requiredQty = ing.requiredQuantity ?? ing.required_quantity;
                        const availableQty = ing.availableQuantity ?? 0;
                        const unit = ing.unit || "pcs";
                        const isMissing = ing.isMissing ?? (availableQty < requiredQty);

                        return (
                            <div
                                key={ing.id || idx}
                                className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-slate-50 border border-slate-100"
                            >
                                {/* Ingredient Name */}
                                <span className={`font-medium ${isMissing ? "text-rose-700" : "text-slate-800"}`}>
                  {ingName}
                </span>

                                {/* Needed vs In Stock Badges */}
                                <div className="flex items-center gap-2">
                  <span className="text-slate-500">
                    Need: <strong className="text-slate-700">{requiredQty} {unit}</strong>
                  </span>

                                    <span
                                        className={`font-semibold px-2 py-0.5 rounded text-[11px] border ${
                                            isMissing
                                                ? "bg-rose-50 text-rose-600 border-rose-200"
                                                : "bg-emerald-50 text-emerald-700 border-emerald-200"
                                        }`}
                                    >
                    Have: {availableQty} {unit}
                  </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}