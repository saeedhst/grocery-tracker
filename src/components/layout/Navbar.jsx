import { NavLink } from "react-router-dom";

export default function Navbar() {
    return (
        <header className="bg-white border-b border-slate-200 mb-8 sticky top-0 z-20">
            <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">🥦</span>
                    <span className="font-bold text-slate-900 text-lg">PantryCloud</span>
                </div>

                <nav className="flex items-center gap-3">
                    <NavLink
                        to="/"
                        end
                        className={({ isActive }) =>
                            `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                isActive
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "text-slate-600 hover:text-slate-900"
                            }`
                        }
                    >
                        Dashboard
                    </NavLink>
                    <NavLink
                        to="/settings"
                        className={({ isActive }) =>
                            `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                isActive
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "text-slate-600 hover:text-slate-900"
                            }`
                        }
                    >
                        Settings
                    </NavLink>
                </nav>
            </div>
        </header>
    );
}