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
        const { id, quantity } = body;

        if (!id || quantity === undefined || quantity === null) {
            return new Response(JSON.stringify({ error: "Item ID and quantity are required" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        const newQty = Math.max(0, Number(quantity));

        await context.env.DB.prepare(
            "UPDATE groceries SET quantity = ? WHERE id = ?"
        )
            .bind(newQty, id)
            .run();

        return new Response(JSON.stringify({ success: true, id, quantity: newQty }), {
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}