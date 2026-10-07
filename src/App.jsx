import { Routes, Route } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import DashboardPage from "./pages/DashboardPage";
import { SettingsProvider } from "./context/SettingsContext";
import SettingsPage from "./pages/SettingsPages.jsx";

export default function App() {
    return (
        <SettingsProvider>
            <div className="min-h-screen bg-slate-50 text-slate-800">
                <Navbar />
                <main className="px-6 pb-12">
                    <Routes>
                        <Route path="/" element={<DashboardPage />} />
                        <Route path="/settings" element={<SettingsPage />} />
                    </Routes>
                </main>
            </div>
        </SettingsProvider>
    );
}