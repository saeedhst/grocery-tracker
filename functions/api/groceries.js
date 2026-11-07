export async function onRequestPatch(context) {
    try {
        const body = await context.request.json();
        const { id, name, category, quantity, unit, location, expiryDate, ah_product_id } = body;

        if (!id) {
            return new Response(JSON.stringify({ error: "Missing item ID" }), { status: 400 });
        }

        // If only updating quantity or ah_product_id, keep existing fields intact
        const existing = await context.env.DB.prepare("SELECT * FROM groceries WHERE id = ?")
            .bind(id)
            .first();

        if (!existing) {
            return new Response(JSON.stringify({ error: "Item not found" }), { status: 404 });
        }

        const updated = {
            name: name !== undefined ? name : existing.name,
            category: category !== undefined ? category : existing.category,
            quantity: quantity !== undefined ? Number(quantity) : existing.quantity,
            unit: unit !== undefined ? unit : existing.unit,
            location: location !== undefined ? location : existing.location,
            expiryDate: expiryDate !== undefined ? expiryDate : existing.expiryDate,
            ah_product_id: ah_product_id !== undefined ? ah_product_id : existing.ah_product_id,
        };

        await context.env.DB.prepare(
            `UPDATE groceries
       SET name = ?, category = ?, quantity = ?, unit = ?, location = ?, expiryDate = ?, ah_product_id = ?
       WHERE id = ?`
        )
            .bind(
                updated.name,
                updated.category,
                updated.quantity,
                updated.unit,
                updated.location,
                updated.expiryDate,
                updated.ah_product_id,
                id
            )
            .run();

        return new Response(JSON.stringify({ id, ...updated }), {
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}