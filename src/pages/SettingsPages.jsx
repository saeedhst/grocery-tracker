import { useSettings } from "../context/SettingsContext";
import EditableTagList from "../components/settings/EditableTagList";

export default function SettingsPage() {
    const {
        locations,
        categories,
        units,
        addLocation,
        removeLocation,
        updateLocation,
        addCategory,
        removeCategory,
        updateCategory,
        addUnit,
        removeUnit,
        updateUnit,
    } = useSettings();

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-slate-900">Inventory Settings</h1>
                <p className="text-sm text-slate-500">
                    Manage your storage zones, categories, and measurement units.
                </p>
            </div>

            <EditableTagList
                title="Storage Locations"
                items={locations}
                onAdd={addLocation}
                onUpdate={updateLocation}
                onRemove={removeLocation}
            />

            <EditableTagList
                title="Item Categories"
                items={categories}
                onAdd={addCategory}
                onUpdate={updateCategory}
                onRemove={removeCategory}
            />

            <EditableTagList
                title="Measurement Units"
                items={units}
                onAdd={addUnit}
                onUpdate={updateUnit}
                onRemove={removeUnit}
                isUnitList={true}
            />
        </div>
    );
}