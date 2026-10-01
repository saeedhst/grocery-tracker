import {INITIAL_GROCERIES} from "./data/mockGroceries.js";

const App = () => {

    return (
        <div>
            <div className="min-h-screen bg-slate-50 p-8">
                <h1 className="text-3xl font-bold text-emerald-600 mb-4">
                    Home Grocery Management System
                </h1>
                <ul className="list-disc pl-5">
                    {INITIAL_GROCERIES.map((item) => (
                        <li key={item.id} className="text-slate-700">
                            {item.name} - {item.quantity} {item.unit} ({item.location})
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}

export default App;