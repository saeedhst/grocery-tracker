export async function onRequestPatch(context) {
    try {
        const body = await context.request.json();
        const { id, name, category, quantity, unit, location, expiryDate } = body;

        if (!id) {
            return new Response(JSON.stringify({ error: "Item ID is required" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        // 1. Fetch current item to allow partial or full updates
        const current = await context.env.DB.prepare(
            "SELECT * FROM groceries WHERE id = ?"
        )
            .bind(id)
            .first();

        if (!current) {
            return new Response(JSON.stringify({ error: "Item not found" }), {
                status: 404,
                headers: { "Content-Type": "application/json" },
            });
        }

        // 2. Merge existing data with updated fields
        const updated = {
            name: name ?? current.name,
            category: category ?? current.category,
            quantity: quantity !== undefined ? Number(quantity) : current.quantity,
            unit: unit ?? current.unit,
            location: location ?? current.location,
            expiryDate: expiryDate !== undefined ? expiryDate : current.expiryDate,
        };

        // 3. Persist changes to Cloudflare D1
        await context.env.DB.prepare(
            "UPDATE groceries SET name = ?, category = ?, quantity = ?, unit = ?, location = ?, expiryDate = ? WHERE id = ?"
        )
            .bind(
                updated.name,
                updated.category,
                updated.quantity,
                updated.unit,
                updated.location,
                updated.expiryDate,
                id
            )
            .run();

        return new Response(JSON.stringify({ success: true, item: { id, ...updated } }), {
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}