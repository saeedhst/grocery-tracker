// Cloudflare Pages Function: /api/groceries
export async function onRequestGet(context) {
    try {
        const { results } = await context.env.DB.prepare(
            "SELECT id, name, category, quantity, unit, location, expiryDate FROM groceries ORDER BY createdAt DESC"
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

export async function onRequestPost(context) {
    try {
        const body = await context.request.json();
        const { id, name, category, quantity, unit, location, expiryDate } = body;

        if (!name || !category || !location) {
            return new Response(JSON.stringify({ error: "Missing required fields" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        const itemId = id || crypto.randomUUID();

        await context.env.DB.prepare(
            "INSERT INTO groceries (id, name, category, quantity, unit, location, expiryDate) VALUES (?, ?, ?, ?, ?, ?, ?)"
        )
            .bind(itemId, name, category, Number(quantity) || 1, unit || "unit", location, expiryDate || "")
            .run();

        return new Response(
            JSON.stringify({ id: itemId, name, category, quantity, unit, location, expiryDate }),
            { status: 201, headers: { "Content-Type": "application/json" } }
        );
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}

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