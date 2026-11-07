// Cloudflare Pages Function: /api/groceries

// 1. GET (Read all items)
export async function onRequestGet(context) {
    try {
        const { results } = await context.env.DB.prepare(
            "SELECT id, name, category, quantity, unit, location, expiryDate, ah_product_id FROM groceries ORDER BY createdAt DESC"
        ).all();

        return new Response(JSON.stringify(results), {
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}

// 2. POST (Create new item)
export async function onRequestPost(context) {
    try {
        const body = await context.request.json();
        const { id, name, category, quantity, unit, location, expiryDate, ah_product_id } = body;

        if (!name || !category || !location) {
            return new Response(JSON.stringify({ error: "Missing required fields" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        const itemId = id || crypto.randomUUID();

        await context.env.DB.prepare(
            "INSERT INTO groceries (id, name, category, quantity, unit, location, expiryDate, ah_product_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
        )
            .bind(
                itemId,
                name,
                category,
                Number(quantity) || 1,
                unit || "unit",
                location,
                expiryDate || "",
                ah_product_id || null
            )
            .run();

        return new Response(
            JSON.stringify({ id: itemId, name, category, quantity, unit, location, expiryDate, ah_product_id }),
            { status: 201, headers: { "Content-Type": "application/json" } }
        );
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}

// 3. DELETE (Remove item)
export async function onRequestDelete(context) {
    try {
        const url = new URL(context.request.url);
        const id = url.searchParams.get("id");

        if (!id) {
            return new Response(JSON.stringify({ error: "Item ID is required" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        await context.env.DB.prepare("DELETE FROM groceries WHERE id = ?").bind(id).run();

        return new Response(JSON.stringify({ success: true, deletedId: id }), {
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}

// 4. PATCH (Update item / quantity / ah_product_id)
// Inside functions/api/groceries.js -> onRequestPatch(context)
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