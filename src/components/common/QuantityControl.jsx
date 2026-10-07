// src/components/common/QuantityControl.jsx
import { QUANTITY_UNITS } from "../../constants/groceryConfig";

export default function QuantityControl({
                                            quantity,
                                            unit,
                                            onQuantityChange,
                                            onUnitChange,
                                            isEditing = false,
                                            min = 0,
                                            step = 1,
                                        }) {
    if (isEditing) {
        return (
            <div className="flex gap-2">
                <div className="w-1/2">
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                        Qty
                    </label>
                    <input
                        type="number"
                        min={min}
                        step={step}
                        value={quantity}
                        onChange={(e) => onQuantityChange(e.target.value)}
                        className="w-full border border-slate-300 rounded p-1 text-sm text-slate-800 focus:outline-emerald-500"
                    />
                </div>
                <div className="w-1/2">
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                        Unit
                    </label>
                    <select
                        value={unit}
                        onChange={(e) => onUnitChange(e.target.value)}
                        className="w-full border border-slate-300 rounded p-1 text-sm text-slate-800 focus:outline-emerald-500 bg-white"
                    >
                        {QUANTITY_UNITS.map((u) => (
                            <option key={u.value} value={u.value}>
                                {u.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-between bg-slate-50 p-2 rounded-lg border border-slate-100">
            <span className="text-xs font-medium text-slate-500">Quantity</span>
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={() => onQuantityChange(Math.max(0, Number(quantity) - 1))}
                    className="w-6 h-6 rounded bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 flex items-center justify-center font-bold text-sm shadow-sm"
                    title="Decrease"
                >
                    -
                </button>
                <span className="text-sm font-semibold text-slate-800 min-w-12 text-center">
          {quantity} {unit}
        </span>
                <button
                    type="button"
                    onClick={() => onQuantityChange(Number(quantity) + 1)}
                    className="w-6 h-6 rounded bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 flex items-center justify-center font-bold text-sm shadow-sm"
                    title="Increase"
                >
                    +
                </button>
            </div>
        </div>
    );
}