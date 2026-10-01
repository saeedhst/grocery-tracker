import {INITIAL_GROCERIES} from "./data/mockGroceries.js";
import GroceryCard from "./components/GroceryCard.jsx";

const App = () => {

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
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {INITIAL_GROCERIES.map((item) => (
                        <GroceryCard key={item.id} item={item} />
                    ))}
                </div>
            </main>
        </div>
    )
}

export default App;