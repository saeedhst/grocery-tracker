// src/services/supermarketApi.js

// Vite provides import.meta.env.MODE ('development' or 'production')
// Fallback dynamically if the env var isn't explicitly defined:
const BASE_URL =
    import.meta.env.VITE_SUPERMARKET_API_BASE_URL ||
    (import.meta.env.DEV
        ? "http://localhost:3000"
        : "https://supermarket-api-ah.saeedhst.workers.dev");

/**
 * Search products by keyword (for search bar / autocomplete)
 * @param {string} query - e.g. "melk", "pindakaas"
 * @param {number} limit - default 5
 */
export async function searchProducts(query, limit = 5) {
    if (!query?.trim()) return { items: [] };

    const url = `${BASE_URL}/api/search?q=${encodeURIComponent(query.trim())}&limit=${limit}`;
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`Search failed (${res.status})`);
    }
    return res.json();
}

/**
 * Best Match: Finds the top matching product and returns full details (nutrition, allergens, images)
 * @param {string} productName - e.g. "Campina halfvolle melk"
 */
export async function getProductByName(productName) {
    if (!productName?.trim()) return null;

    const url = `${BASE_URL}/api/product?q=${encodeURIComponent(productName.trim())}`;
    const res = await fetch(url);
    if (res.status === 404) return null;
    if (!res.ok) {
        throw new Error(`Product lookup failed (${res.status})`);
    }
    return res.json();
}

/**
 * Fetch product by exact Albert Heijn ID
 * @param {string|number} id - e.g. "3579" or 3579
 */
export async function getProductById(id) {
    if (!id) return null;

    const url = `${BASE_URL}/api/product/${id}`;
    const res = await fetch(url);
    if (res.status === 404) return null;
    if (!res.ok) {
        throw new Error(`Product lookup failed (${res.status})`);
    }
    return res.json();
}