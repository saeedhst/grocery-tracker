export default function StatsOverview({ groceries }) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const stats = groceries.reduce(
        (acc, item) => {
            acc.total += 1;

            if (Number(item.quantity) <= 1) {
                acc.lowStock += 1;
            }

            if (item.expiryDate) {
                const exp = new Date(item.expiryDate);
                exp.setHours(0, 0, 0, 0);
                const diffDays = Math.ceil((exp - today) / (1000 * 60 * 60 * 24));
                if (diffDays <= 3) {
                    acc.expiringSoon += 1;
                }
            }
            return acc;
        },
        { total: 0, expiringSoon: 0, lowStock: 0 }
    );

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
                        Total Items
                    </p>
                    <h3 className="text-2xl font-bold text-slate-900 mt-1">{stats.total}</h3>
                </div>
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg">
                    📦
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                    <p className="text-xs font-medium text-amber-600 uppercase tracking-wide">
                        Expiring Soon (≤ 3d)
                    </p>
                    <h3 className="text-2xl font-bold text-amber-600 mt-1">{stats.expiringSoon}</h3>
                </div>
                <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-lg">
                    ⚠️
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                    <p className="text-xs font-medium text-rose-500 uppercase tracking-wide">
                        Low Stock (≤ 1)
                    </p>
                    <h3 className="text-2xl font-bold text-rose-600 mt-1">{stats.lowStock}</h3>
                </div>
                <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-lg">
                    🛒
                </div>
            </div>
        </div>
    );
}