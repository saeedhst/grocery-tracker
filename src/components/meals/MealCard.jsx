export default function MealCard({ meal, availability, onDelete }) {
    const { canMake, missingItems } = availability;

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
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
                        className="text-slate-400 hover:text-rose-600 p-1"
                        title="Delete meal"
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

                {/* Status Badge */}
                <div className="mb-4">
                    {canMake ? (
                        <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-emerald-100 text-emerald-800 inline-flex items-center gap-1">
              <span>●</span> Ready to cook
            </span>
                    ) : (
                        <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-rose-100 text-rose-800 inline-flex items-center gap-1">
              <span>●</span> Missing {missingItems.length} ingredient(s)
            </span>
                    )}
                </div>

                {/* Ingredients list */}
                <div className="space-y-1.5 border-t border-slate-100 pt-3">
                    <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1">
                        Ingredients:
                    </p>
                    {meal.ingredients.map((ing, idx) => {
                        const isMissing = missingItems.some(
                            (m) => m.name.toLowerCase() === ing.grocery_name.toLowerCase()
                        );
                        return (
                            <div
                                key={idx}
                                className="flex items-center justify-between text-xs py-1"
                            >
                <span
                    className={
                        isMissing ? "text-rose-600 font-medium line-through" : "text-slate-700"
                    }
                >
                  {ing.grocery_name}
                </span>
                                <span className="text-slate-500 font-medium">
                  {ing.required_quantity} {ing.unit}
                </span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}