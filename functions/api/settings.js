// Cloudflare Pages Function: /api/settings

export async function onRequestGet(context) {
    try {
        const [locationsRes, categoriesRes, unitsRes] = await Promise.all([
            context.env.DB.prepare("SELECT name FROM app_locations ORDER BY name ASC").all(),
            context.env.DB.prepare("SELECT name FROM app_categories ORDER BY name ASC").all(),
            context.env.DB.prepare("SELECT value, label FROM app_units ORDER BY label ASC").all(),
        ]);

        return new Response(
            JSON.stringify({
                locations: locationsRes.results.map((r) => r.name),
                categories: categoriesRes.results.map((r) => r.name),
                units: unitsRes.results,
            }),
            { headers: { "Content-Type": "application/json" } }
        );
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}

export async function onRequestPost(context) {
    try {
        const { type, name, label, value } = await context.request.json();
        const id = crypto.randomUUID();

        if (type === "location") {
            await context.env.DB.prepare(
                "INSERT INTO app_locations (id, name) VALUES (?, ?)"
            ).bind(id, name.trim()).run();
            return new Response(JSON.stringify({ success: true, name: name.trim() }), { status: 201 });
        }

        if (type === "category") {
            await context.env.DB.prepare(
                "INSERT INTO app_categories (id, name) VALUES (?, ?)"
            ).bind(id, name.trim()).run();
            return new Response(JSON.stringify({ success: true, name: name.trim() }), { status: 201 });
        }

        if (type === "unit") {
            await context.env.DB.prepare(
                "INSERT INTO app_units (value, label) VALUES (?, ?)"
            ).bind(value.trim(), label.trim()).run();
            return new Response(JSON.stringify({ success: true, value: value.trim(), label: label.trim() }), { status: 201 });
        }

        return new Response(JSON.stringify({ error: "Invalid type" }), { status: 400 });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}

export async function onRequestPatch(context) {
    try {
        const { type, oldName, newName, value, newLabel } = await context.request.json();

        if (type === "location") {
            // Update location table and cascade to existing groceries
            await context.env.DB.batch([
                context.env.DB.prepare("UPDATE app_locations SET name = ? WHERE name = ?").bind(newName.trim(), oldName),
                context.env.DB.prepare("UPDATE groceries SET location = ? WHERE location = ?").bind(newName.trim(), oldName),
            ]);
            return new Response(JSON.stringify({ success: true }));
        }

        if (type === "category") {
            // Update category table and cascade to existing groceries
            await context.env.DB.batch([
                context.env.DB.prepare("UPDATE app_categories SET name = ? WHERE name = ?").bind(newName.trim(), oldName),
                context.env.DB.prepare("UPDATE groceries SET category = ? WHERE category = ?").bind(newName.trim(), oldName),
            ]);
            return new Response(JSON.stringify({ success: true }));
        }

        if (type === "unit") {
            await context.env.DB.prepare("UPDATE app_units SET label = ? WHERE value = ?").bind(newLabel.trim(), value).run();
            return new Response(JSON.stringify({ success: true }));
        }

        return new Response(JSON.stringify({ error: "Invalid type" }), { status: 400 });
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
        const type = url.searchParams.get("type");
        const name = url.searchParams.get("name");
        const value = url.searchParams.get("value");

        if (type === "location" && name) {
            await context.env.DB.prepare("DELETE FROM app_locations WHERE name = ?").bind(name).run();
            return new Response(JSON.stringify({ success: true }));
        }

        if (type === "category" && name) {
            await context.env.DB.prepare("DELETE FROM app_categories WHERE name = ?").bind(name).run();
            return new Response(JSON.stringify({ success: true }));
        }

        if (type === "unit" && value) {
            await context.env.DB.prepare("DELETE FROM app_units WHERE value = ?").bind(value).run();
            return new Response(JSON.stringify({ success: true }));
        }

        return new Response(JSON.stringify({ error: "Missing required delete parameters" }), { status: 400 });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}