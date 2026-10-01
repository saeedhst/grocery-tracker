const GroceryCard = ({item}) => {

    return (
        <div
            className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 flex flex-col justify-between hover:shadow-md transition-shadow">
            <div>
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg text-slate-800">{item.name}</h3>
                    <span className="text-xs px-2 py-1 bg-slate-100 text-slate-600 rounded-full font-medium">
            {item.location}
          </span>
                </div>
                <p className="text-sm text-slate-500 mb-2">
                    Category: <span className="font-medium text-slate-700">{item.category}</span>
                </p>
                <p className="text-sm text-slate-600">
                    Quantity: <span className="font-semibold text-slate-900">{item.quantity} {item.unit}</span>
                </p>
            </div>

            <div
                className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Expires:</span>
                <span className="font-medium text-slate-700">{item.expiryDate}</span>
            </div>
        </div>
    )
}

export default GroceryCard;