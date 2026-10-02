// import {INITIAL_GROCERIES} from "./data/mockGroceries.js";
import GroceryCard from "./components/GroceryCard.jsx";
import {useState, useEffect} from "react";

const App = () => {

    const [groceries, setGroceries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


    useEffect(() => {
        async function loadGroceries() {
            try {
                setLoading(true);
                const res = await fetch("/api/groceries");
                if (!res.ok) {
                    throw new Error("Failed to load groceries: ${res.statusText}");
                }
                const data = await res.json()
                setGroceries(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }
        loadGroceries();
    }, [])

    const handleDeleteItem = async (id) => {
        try {
            const res = await fetch(`api/groceries?id=${id}`, {
                method: "DELETE",
            });
            if (!res.ok) {
                throw new Error("Failed to delete item from database");
            }
            setGroceries((prev)=> prev.filter((item)=> item.id !== id));
        } catch (err){
            alert(err.message);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-10">
            <header className="max-w-6xl mx-auto mb-8">
                <h1 className="text-3xl font-bold text-slate-900">
                    Home Grocery Management
                </h1>
                <p className="text-slate-500 text-sm mt-1">
                    Keep track of pantry, fridge, and freezer inventory.
                </p>
            </header>

            <main className="max-w-6xl mx-auto">
                {loading && (
                    <div className="text-center py-12 text-slate-500">
                        Loading your groceries from the cloud...
                    </div>
                )}

                {error && (
                    <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 mb-6">
                        Error: {error}
                    </div>
                )}

                {!loading && !error && groceries.length === 0 && (
                    <p className="text-center text-slate-500 py-12">
                        Your inventory is empty.
                    </p>
                )}

                {!loading && !error && groceries.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {groceries.map((item) => (
                            <GroceryCard
                                key={item.id}
                                item={item}
                                onDelete={handleDeleteItem}
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}

export default App;