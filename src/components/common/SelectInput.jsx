// src/components/common/SelectInput.jsx
export default function SelectInput({
                                        label,
                                        name,
                                        value,
                                        onChange,
                                        options = [],
                                        allowCustom = false,
                                        className = "",
                                    }) {
    return (
        <div className={className}>
            {label && (
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                    {label}
                </label>
            )}
            <select
                name={name}
                value={value}
                onChange={onChange}
                className="w-full border border-slate-300 rounded-lg p-2 text-sm text-slate-800 bg-white focus:outline-emerald-500 focus:ring-1 focus:ring-emerald-500"
            >
                {options.map((opt) => {
                    const optValue = typeof opt === "string" ? opt : opt.value;
                    const optLabel = typeof opt === "string" ? opt : opt.label;
                    return (
                        <option key={optValue} value={optValue}>
                            {optLabel}
                        </option>
                    );
                })}
            </select>
        </div>
    );
}