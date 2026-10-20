export async function onRequestGet(context) {
    try {
        const {results: lists} = await context.env.DB.prepare(
            "SELECT * FROM shopping_lists ORDER BY is_default DESC, name ASC"
        ).all();

        const {results: items} = await context.env.DB.prepare(
            "SELECT * FROM shopping_list_items ORDER BY is_checked ASC, createdAt DESC"
        ).all();

        const result = lists.map((list) => ({
            ...list,
            is_default: Boolean(list.is_default),
            items: items.filter((item) => item.list_id === list.id).map((i) => ({
                ...i,
                is_checked: Boolean(i.is_checked),
            })),
        }));

        return new Response(JSON.stringify(result), {
            headers: {"Content-Type": "application/json"},
        });
    } catch (error) {
        return new Response(JSON.stringify({error: error.message}), {
            status: 500,
            headers: {"Content-Type": "application/json"},
        });
    }
}

export async function onRequestPost(context) {
    try {
        const body = await context.request.json();
        const {action} = body;

        // Action 1: Create a new shopping list
        if (action === "create_list") {
            const {name} = body;
            if (!name?.trim()) {
                return new Response(JSON.stringify({error: "List name is required"}), {status: 400});
            }
            const listId = "list_" + crypto.randomUUID().slice(0, 8);
            await context.env.DB.prepare(
                "INSERT INTO shopping_lists (id, name, is_default) VALUES (?, ?, 0)"
            ).bind(listId, name.trim()).run();

            return new Response(JSON.stringify({
                id: listId,
                name: name.trim(),
                is_default: false,
                items: []
            }), {status: 201});
        }

        // Action 2: Add item to one or more lists
        if (action === "add_item_to_lists") {
            const {item, listIds} = body; // listIds = ['list_default', ...]
            if (!item?.name || !listIds?.length) {
                return new Response(JSON.stringify({error: "Item and target listIds required"}), {status: 400});
            }

            const statements = [];
            for (const listId of listIds) {
                const itemId = "sli_" + crypto.randomUUID().slice(0, 8);
                statements.push(
                    context.env.DB.prepare(
                        `INSERT INTO shopping_list_items (id, list_id, item_name, category, quantity, unit)
                         VALUES (?, ?, ?, ?, ?, ?)`
                    ).bind(
                        itemId,
                        listId,
                        item.name.trim(),
                        item.category || "General",
                        Number(item.quantity) || 1,
                        item.unit || "pcs"
                    )
                );
            }
            await context.env.DB.batch(statements);
            return new Response(JSON.stringify({success: true}), {status: 201});
        }

        return new Response(JSON.stringify({error: "Invalid action"}), {status: 400});
    } catch (error) {
        return new Response(JSON.stringify({error: error.message}), {
            status: 500,
            headers: {"Content-Type": "application/json"},
        });
    }
}

export async function onRequestPatch(context) {
    try {
        const {itemId, is_checked} = await context.request.json();
        if (!itemId) {
            return new Response(JSON.stringify({error: "Item ID required"}), {status: 400});
        }

        await context.env.DB.prepare(
            "UPDATE shopping_list_items SET is_checked = ? WHERE id = ?"
        ).bind(is_checked ? 1 : 0, itemId).run();

        return new Response(JSON.stringify({success: true}), {
            headers: {"Content-Type": "application/json"},
        });
    } catch (error) {
        return new Response(JSON.stringify({error: error.message}), {
            status: 500,
            headers: {"Content-Type": "application/json"},
        });
    }
}

export async function onRequestDelete(context) {
    try {
        const url = new URL(context.request.url);
        const listId = url.searchParams.get("listId");
        const itemId = url.searchParams.get("itemId");

        // Delete a single item
        if (itemId) {
            await context.env.DB.prepare("DELETE FROM shopping_list_items WHERE id = ?").bind(itemId).run();
            return new Response(JSON.stringify({success: true}));
        }

        // Delete a list (protected check)
        if (listId) {
            const list = await context.env.DB.prepare("SELECT is_default FROM shopping_lists WHERE id = ?")
                .bind(listId)
                .first();

            if (list && list.is_default) {
                return new Response(JSON.stringify({error: "Default list cannot be deleted"}), {status: 400});
            }

            await context.env.DB.batch([
                context.env.DB.prepare("DELETE FROM shopping_list_items WHERE list_id = ?").bind(listId),
                context.env.DB.prepare("DELETE FROM shopping_lists WHERE id = ?").bind(listId),
            ]);
            return new Response(JSON.stringify({success: true}));
        }

        return new Response(JSON.stringify({error: "Missing delete criteria"}), {status: 400});
    } catch (error) {
        return new Response(JSON.stringify({error: error.message}), {
            status: 500,
            headers: {"Content-Type": "application/json"},
        });
    }
}