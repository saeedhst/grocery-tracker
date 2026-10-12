export default function MealStatsOverview({ meals = [], checkMealAvailability }) {
    const stats = meals.reduce(
        (acc, meal) => {
            acc.total += 1;
            const { canMake } = checkMealAvailability(meal);
            if (canMake) {
                acc.readyToCook += 1;
            } else {
                acc.missingIngredients += 1;
            }
            return acc;
        },
        { total: 0, readyToCook: 0, missingIngredients: 0 }
    );

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                        Total Meals
                    </p>
                    <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.total}</h3>
                </div>
                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-lg">
                    🍲
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                    <p className="text-xs font-medium text-emerald-600 uppercase tracking-wide">
                        Ready to Cook
                    </p>
                    <h3 className="text-2xl font-bold text-emerald-600 mt-1">{stats.readyToCook}</h3>
                </div>
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg">
                    ✅
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                    <p className="text-xs font-medium text-rose-500 uppercase tracking-wide">
                        Unavailable (Low Stock)
                    </p>
                    <h3 className="text-2xl font-bold text-rose-600 mt-1">{stats.missingIngredients}</h3>
                </div>
                <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-lg">
                    ⚠️
                </div>
            </div>
        </div>
    );
}