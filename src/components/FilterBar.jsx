export const LOCATIONS = ["All", "Fridge", "Pantry", "Freezer"];

export default function FilterBar({
                                      selectedLocation,
                                      onSelectLocation,
                                      searchQuery,
                                      onSearchChange,
                                      sortBy,
                                      onSortChange,
                                      viewMode,
                                      onViewModeChange,
                                  }) {
    return (
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
            {/* Search Input */}
            <div className="w-full md:w-64">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Search items..."
                    className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-emerald-500"
                />
            </div>

            {/* Location Filter Pills */}
            <div className="flex flex-wrap gap-2">
                {LOCATIONS.map((loc) => {
                    const isActive = selectedLocation === loc;
                    return (
                        <button
                            key={loc}
                            type="button"
                            onClick={() => onSelectLocation(loc)}
                            className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                                isActive
                                    ? "bg-emerald-600 text-white shadow-sm"
                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }`}
                        >
                            {loc}
                        </button>
                    );
                })}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 text-sm text-slate-600">
                <label htmlFor="sort-select" className="text-xs font-medium text-slate-500">
                    Sort by:
                </label>
                <select
                    id="sort-select"
                    value={sortBy}
                    onChange={(e) => onSortChange(e.target.value)}
                    className="border border-slate-200 rounded-lg px-2.5 py-1 text-xs focus:outline-emerald-500 bg-white"
                >
                    <option value="expiryAsc">Expiration (Earliest)</option>
                    <option value="expiryDesc">Expiration (Latest)</option>
                    <option value="nameAsc">Name (A - Z)</option>
                    <option value="quantityDesc">Quantity (High to Low)</option>
                </select>
            </div>

            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                <button
                    type="button"
                    onClick={() => onViewModeChange("grid")}
                    className={`px-2 py-1 text-xs font-medium rounded ${
                        viewMode === "grid" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
                    }`}
                >
                    Grid
                </button>
                <button
                    type="button"
                    onClick={() => onViewModeChange("table")}
                    className={`px-2 py-1 text-xs font-medium rounded ${
                        viewMode === "table" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
                    }`}
                >
                    Table
                </button>
            </div>
        </div>
    );
}