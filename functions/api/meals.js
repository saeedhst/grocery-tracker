// GET all meals with ingredients, POST to create a meal, DELETE to remove
// functions/api/meals.js

export async function onRequestGet(context) {
    try {
        // 1. Fetch all meals
        const { results: meals } = await context.env.DB.prepare(
            "SELECT * FROM meals ORDER BY createdAt DESC"
        ).all();

        // 2. Fetch all ingredients
        const { results: ingredients } = await context.env.DB.prepare(
            "SELECT * FROM meal_ingredients"
        ).all();

        // 3. Fetch all current inventory items
        const { results: groceries } = await context.env.DB.prepare(
            "SELECT name, quantity, unit FROM groceries"
        ).all();

        // 4. Combine and compute stock levels
        const mealsWithStock = meals.map((meal) => {
            let canMake = true;

            const enrichedIngredients = ingredients
                .filter((ing) => ing.meal_id === meal.id)
                .map((ing) => {
                    // Find matching item in inventory (case-insensitive)
                    const matchedItem = groceries.find(
                        (g) => g.name.trim().toLowerCase() === ing.grocery_name.trim().toLowerCase()
                    );

                    const availableQty = matchedItem ? Number(matchedItem.quantity) : 0;
                    const isMissing = availableQty < Number(ing.required_quantity);

                    if (isMissing) {
                        canMake = false;
                    }

                    return {
                        id: ing.id,
                        name: ing.grocery_name,
                        requiredQuantity: Number(ing.required_quantity),
                        availableQuantity: availableQty,
                        unit: ing.unit || matchedItem?.unit || "pcs",
                        isMissing,
                    };
                });

            return {
                ...meal,
                canMake,
                ingredients: enrichedIngredients,
            };
        });

        return new Response(JSON.stringify(mealsWithStock), {
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
        const { name, description, ingredients } = await context.request.json();

        if (!name || !ingredients || ingredients.length === 0) {
            return new Response(
                JSON.stringify({ error: "Meal name and at least one ingredient are required" }),
                { status: 400, headers: { "Content-Type": "application/json" } }
            );
        }

        const mealId = crypto.randomUUID();

        const statements = [
            context.env.DB.prepare(
                "INSERT INTO meals (id, name, description) VALUES (?, ?, ?)"
            ).bind(mealId, name.trim(), description?.trim() || ""),
        ];

        for (const ing of ingredients) {
            const ingId = crypto.randomUUID();
            statements.push(
                context.env.DB.prepare(
                    "INSERT INTO meal_ingredients (id, meal_id, grocery_name, required_quantity, unit) VALUES (?, ?, ?, ?, ?)"
                ).bind(
                    ingId,
                    mealId,
                    ing.name,
                    Number(ing.requiredQuantity) || 1,
                    ing.unit || "pcs"
                )
            );
        }

        await context.env.DB.batch(statements);

        return new Response(
            JSON.stringify({
                id: mealId,
                name: name.trim(),
                description: description?.trim() || "",
                ingredients,
            }),
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
            return new Response(JSON.stringify({ error: "Meal ID is required" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        await context.env.DB.batch([
            context.env.DB.prepare("DELETE FROM meal_ingredients WHERE meal_id = ?").bind(id),
            context.env.DB.prepare("DELETE FROM meals WHERE id = ?").bind(id),
        ]);

        return new Response(JSON.stringify({ success: true }), {
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}