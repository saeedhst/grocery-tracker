// GET all meals with ingredients, POST to create a meal, DELETE to remove
export async function onRequestGet(context) {
    try {
        const { results: meals } = await context.env.DB.prepare(
            "SELECT * FROM meals ORDER BY createdAt DESC"
        ).all();

        const { results: ingredients } = await context.env.DB.prepare(
            "SELECT * FROM meal_ingredients"
        ).all();

        const mealsWithIngredients = meals.map((meal) => ({
            ...meal,
            ingredients: ingredients.filter((ing) => ing.meal_id === meal.id),
        }));

        return new Response(JSON.stringify(mealsWithIngredients), {
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