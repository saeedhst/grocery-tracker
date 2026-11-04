import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useSettings } from "../context/SettingsContext";

const SUPERMARKET_API_BASE =
    import.meta.env.VITE_SUPERMARKET_API_BASE_URL ||
    "https://supermarket-api-ah.saeedhst.workers.dev";

const NUTRISCORE_COLORS = {
    A: "bg-emerald-600 text-white",
    B: "bg-lime-500git  text-white",
    C: "bg-amber-400 text-slate-900",
    D: "bg-orange-500 text-white",
    E: "bg-rose-600 text-white",
};

export default function ItemDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { locations, categories, units } = useSettings();

    // Local Inventory State
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    // External Supermarket API State
    const [productData, setProductData] = useState(null);
    const [productLoading, setProductLoading] = useState(false);
    const [productError, setProductError] = useState(null);

    // 1. Load item from Cloudflare D1
    useEffect(() => {
        async function loadItem() {
            try {
                setLoading(true);
                const res = await fetch("/api/groceries");
                if (!res.ok) throw new Error("Failed to load inventory");
                const list = await res.json();
                const found = list.find((g) => String(g.id) === String(id));
                if (!found) {
                    setError("Item not found");
                } else {
                    setItem(found);
                    setFormData(found);
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        loadItem();
    }, [id]);

    // 2. Fetch Supermarket Data whenever item.name is loaded or updated
    useEffect(() => {
        if (!item?.name) return;

        const controller = new AbortController();

        async function fetchSupermarketProduct() {
            try {
                setProductLoading(true);
                setProductError(null);

                const url = `${SUPERMARKET_API_BASE.replace(/\/$/, "")}/api/product?q=${encodeURIComponent(
                    item.name.trim()
                )}`;

                const res = await fetch(url, { signal: controller.signal });
                if (!res.ok) {
                    throw new Error(`Supermarket lookup returned ${res.status}`);
                }
                const data = await res.json();
                setProductData(data);
            } catch (err) {
                if (err.name !== "AbortError") {
                    setProductError(err.message);
                    setProductData(null);
                }
            } finally {
                setProductLoading(false);
            }
        }

        fetchSupermarketProduct();
        return () => controller.abort();
    }, [item?.name]);

    const getExpiryDetails = (dateString) => {
        if (!dateString)
            return { label: "No expiration date", color: "bg-slate-100 text-slate-600" };
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const expDate = new Date(dateString);
        expDate.setHours(0, 0, 0, 0);
        const diffDays = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));

        if (diffDays < 0)
            return {
                label: `Expired (${Math.abs(diffDays)} days ago)`,
                color: "bg-red-100 text-red-700",
            };
        if (diffDays === 0)
            return { label: "Expires today", color: "bg-red-100 text-red-700" };
        if (diffDays <= 3)
            return {
                label: `Expires in ${diffDays} day(s)`,
                color: "bg-amber-100 text-amber-800",
            };
        return {
            label: `Fresh (${diffDays} days left)`,
            color: "bg-emerald-100 text-emerald-800",
        };
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            const payload = {
                ...formData,
                quantity: Number(formData.quantity) || 0,
            };

            const res = await fetch("/api/groceries", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error("Failed to update item");

            setItem(payload);
            setIsEditing(false);
        } catch (err) {
            alert(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm(`Are you sure you want to delete "${item.name}"?`)) return;
        try {
            setDeleting(true);
            const res = await fetch(`/api/groceries?id=${item.id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete item");
            navigate("/");
        } catch (err) {
            alert(err.message);
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className="text-center py-16 text-slate-400">Loading item details...</div>
        );
    }

    if (error || !item) {
        return (
            <div className="max-w-2xl mx-auto text-center py-12">
                <p className="text-rose-600 mb-4">{error || "Item could not be found."}</p>
                <Link to="/" className="text-emerald-600 hover:underline font-medium text-sm">
                    ← Back to Dashboard
                </Link>
            </div>
        );
    }

    const expiry = getExpiryDetails(item.expiryDate);
    const primaryImage = productData?.images?.[0];

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Top Action Bar */}
            <div className="flex items-center justify-between">
                <Link
                    to="/"
                    className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1"
                >
                    ← Back to Inventory
                </Link>
                {!isEditing && (
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setIsEditing(true)}
                            className="px-3.5 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors shadow-sm"
                        >
                            Edit Item
                        </button>
                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={deleting}
                            className="px-3.5 py-1.5 text-xs font-medium rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors"
                        >
                            {deleting ? "Deleting..." : "Delete"}
                        </button>
                    </div>
                )}
            </div>

            {isEditing ? (
                /* Edit Form */
                <form
                    onSubmit={handleSave}
                    className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4"
                >
                    <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
                        Edit Item Details
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">
                                Item Name
                            </label>
                            <input
                                type="text"
                                name="name"
                                required
                                value={formData.name || ""}
                                onChange={handleChange}
                                className="w-full border border-slate-300 rounded-lg p-2 focus:outline-emerald-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">
                                Category
                            </label>
                            <select
                                name="category"
                                value={formData.category || ""}
                                onChange={handleChange}
                                className="w-full border border-slate-300 rounded-lg p-2 focus:outline-emerald-500 bg-white"
                            >
                                {categories.map((c) => (
                                    <option key={c} value={c}>
                                        {c}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">
                                Location
                            </label>
                            <select
                                name="location"
                                value={formData.location || ""}
                                onChange={handleChange}
                                className="w-full border border-slate-300 rounded-lg p-2 focus:outline-emerald-500 bg-white"
                            >
                                {locations.map((l) => (
                                    <option key={l} value={l}>
                                        {l}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">
                                Expiry Date
                            </label>
                            <input
                                type="date"
                                name="expiryDate"
                                value={formData.expiryDate || ""}
                                onChange={handleChange}
                                className="w-full border border-slate-300 rounded-lg p-2 focus:outline-emerald-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">
                                Quantity
                            </label>
                            <input
                                type="number"
                                step="any"
                                name="quantity"
                                value={formData.quantity ?? 1}
                                onChange={handleChange}
                                className="w-full border border-slate-300 rounded-lg p-2 focus:outline-emerald-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-slate-500 mb-1">
                                Unit
                            </label>
                            <select
                                name="unit"
                                value={formData.unit || "pcs"}
                                onChange={handleChange}
                                className="w-full border border-slate-300 rounded-lg p-2 focus:outline-emerald-500 bg-white"
                            >
                                {units.map((u) => (
                                    <option key={u.value} value={u.value}>
                                        {u.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={() => {
                                setFormData(item);
                                setIsEditing(false);
                            }}
                            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-2 text-xs rounded-lg transition-colors disabled:opacity-50"
                        >
                            {saving ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            ) : (
                <>
                    {/* 1. Hero Card: Product Image in Front of Item Name + Inventory Details */}
                    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                            <div className="flex items-center gap-4">
                                {/* Product Image in front of the item name */}
                                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl border border-slate-200 bg-slate-50 flex-shrink-0 flex items-center justify-center overflow-hidden p-1.5">
                                    {productLoading ? (
                                        <div className="w-full h-full animate-pulse bg-slate-200 rounded-lg" />
                                    ) : primaryImage ? (
                                        <img
                                            src={primaryImage}
                                            alt={productData?.title || item.name}
                                            className="w-full h-full object-contain"
                                        />
                                    ) : (
                                        <span className="text-3xl" role="img" aria-label="grocery">
                      🛒
                    </span>
                                    )}
                                </div>

                                {/* Title, Brand & Category */}
                                <div>
                                    <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      {item.category || "General"}
                    </span>
                                        {productData?.brand && (
                                            <span className="text-xs font-medium text-slate-500">
                        • {productData.brand}
                      </span>
                                        )}
                                    </div>

                                    <h1 className="text-2xl font-bold text-slate-900 mt-1">
                                        {item.name}
                                    </h1>

                                    {productData?.title && productData.title !== item.name && (
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            Matched product: <span className="font-medium text-slate-700">{productData.title}</span>
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Expiry Status Badge */}
                            <div className="self-start sm:self-center">
                <span
                    className={`text-xs px-3 py-1 rounded-full font-semibold whitespace-nowrap ${expiry.color}`}
                >
                  {expiry.label}
                </span>
                            </div>
                        </div>

                        {/* Local Inventory Details Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide block mb-1">
                  Storage Zone
                </span>
                                <p className="text-base font-semibold text-slate-800">{item.location}</p>
                            </div>

                            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide block mb-1">
                  In Stock
                </span>
                                <p className="text-base font-semibold text-slate-800">
                                    {item.quantity} {item.unit}
                                </p>
                            </div>

                            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide block mb-1">
                  Expiration Date
                </span>
                                <p className="text-base font-semibold text-slate-800">
                                    {item.expiryDate || "Not specified"}
                                </p>
                            </div>

                            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide block mb-1">
                  SKU / Barcode
                </span>
                                <p className="text-xs font-mono font-semibold text-slate-700 break-all">
                                    {productData?.sku || "—"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* 2. Supermarket Dynamic Information Boxes */}
                    {productLoading && (
                        <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-sm text-slate-500 shadow-sm">
                            Fetching supermarket product specifications for "{item.name}"...
                        </div>
                    )}

                    {productError && !productLoading && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800">
                            Could not load supermarket details for "{item.name}" ({productError}).
                        </div>
                    )}

                    {productData && !productLoading && (
                        <div className="space-y-6">
                            {/* Row 1: Price Card & Product Overview Card */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Dynamic Price Box */}
                                {productData.price && (
                                    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                          Supermarket Price
                        </span>
                                                {productData.price.isOnSale && (
                                                    <span className="text-[11px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                            {productData.price.discountLabel || "Bonus / Sale"}
                          </span>
                                                )}
                                            </div>

                                            <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-3xl font-extrabold text-slate-900">
                          {productData.price.currency === "EUR" ? "€" : productData.price.currency}
                            {Number(productData.price.current).toFixed(2)}
                        </span>
                                                {productData.price.unitSize && (
                                                    <span className="text-xs font-medium text-slate-500">
                            / {productData.price.unitSize}
                          </span>
                                                )}
                                            </div>

                                            {productData.price.pricePerUnit && (
                                                <p className="text-xs text-slate-500 mt-1">
                                                    {productData.price.pricePerUnit}
                                                </p>
                                            )}
                                        </div>

                                        {productData.sourceUrl && (
                                            <a
                                                href={productData.sourceUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="mt-4 inline-flex items-center justify-center w-full px-3 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                                            >
                                                View on Albert Heijn ↗
                                            </a>
                                        )}
                                    </div>
                                )}

                                {/* Dynamic Description & Category Box */}
                                <div className="md:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col justify-between space-y-3">
                                    <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-1">
                      Product Description
                    </span>
                                        <p className="text-sm text-slate-700 leading-relaxed">
                                            {productData.description || "No description available."}
                                        </p>
                                    </div>

                                    <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                                        {productData.category && (
                                            <span>
                        <strong className="text-slate-700">Aisle:</strong> {productData.category}
                      </span>
                                        )}
                                        {productData.id && (
                                            <span className="font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded">
                        AH ID: {productData.id}
                      </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Row 2: Nutrition Facts Box */}
                            {productData.nutrition && (
                                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
                                        <div>
                                            <h2 className="text-base font-bold text-slate-900">
                                                Nutrition Facts
                                            </h2>
                                            {productData.nutrition.basis && (
                                                <p className="text-xs text-slate-500">
                                                    Values per {productData.nutrition.basis}
                                                </p>
                                            )}
                                        </div>

                                        {/* Nutri-Score Badge */}
                                        {productData.nutrition.nutriscore && (
                                            <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-slate-500 uppercase">
                          Nutri-Score
                        </span>
                                                <span
                                                    className={`w-8 h-8 rounded-lg font-extrabold text-sm flex items-center justify-center shadow-sm ${
                                                        NUTRISCORE_COLORS[productData.nutrition.nutriscore] ||
                                                        "bg-slate-200 text-slate-800"
                                                    }`}
                                                >
                          {productData.nutrition.nutriscore}
                        </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Macro Nutrient Highlight Pills */}
                                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5 mb-4">
                                        {productData.nutrition.energyKcal !== undefined && (
                                            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-center">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          Energy
                        </span>
                                                <span className="text-sm font-bold text-slate-800">
                          {productData.nutrition.energyKcal} kcal
                        </span>
                                            </div>
                                        )}
                                        {productData.nutrition.fat && (
                                            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-center">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          Fat
                        </span>
                                                <span className="text-sm font-bold text-slate-800">
                          {productData.nutrition.fat}
                        </span>
                                            </div>
                                        )}
                                        {productData.nutrition.saturatedFat && (
                                            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-center">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          Sat. Fat
                        </span>
                                                <span className="text-sm font-bold text-slate-800">
                          {productData.nutrition.saturatedFat}
                        </span>
                                            </div>
                                        )}
                                        {productData.nutrition.carbohydrates && (
                                            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-center">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          Carbs
                        </span>
                                                <span className="text-sm font-bold text-slate-800">
                          {productData.nutrition.carbohydrates}
                        </span>
                                            </div>
                                        )}
                                        {productData.nutrition.sugars && (
                                            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-center">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          Sugars
                        </span>
                                                <span className="text-sm font-bold text-slate-800">
                          {productData.nutrition.sugars}
                        </span>
                                            </div>
                                        )}
                                        {productData.nutrition.fiber && (
                                            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-center">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          Fiber
                        </span>
                                                <span className="text-sm font-bold text-slate-800">
                          {productData.nutrition.fiber}
                        </span>
                                            </div>
                                        )}
                                        {productData.nutrition.protein && (
                                            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-center">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          Protein
                        </span>
                                                <span className="text-sm font-bold text-slate-800">
                          {productData.nutrition.protein}
                        </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Nutrition Claims */}
                                    {productData.nutrition.claims?.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5 pt-2">
                                            {productData.nutrition.claims.map((claim, idx) => (
                                                <span
                                                    key={idx}
                                                    className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-medium"
                                                >
                          ✓ {claim}
                        </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Row 3: Ingredients & Allergens Boxes */}
                            {(productData.ingredients || productData.allergens?.length > 0) && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {productData.ingredients && (
                                        <div className="md:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
                        Ingredients
                      </span>
                                            <p className="text-xs text-slate-700 leading-relaxed">
                                                {productData.ingredients}
                                            </p>
                                        </div>
                                    )}

                                    {productData.allergens?.length > 0 && (
                                        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                      <span className="text-xs font-semibold uppercase tracking-wider text-rose-500 block mb-2">
                        Allergens
                      </span>
                                            <div className="flex flex-wrap gap-1.5">
                                                {productData.allergens.map((allergen, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="text-xs px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 font-semibold"
                                                    >
                            ⚠️ {allergen}
                          </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}