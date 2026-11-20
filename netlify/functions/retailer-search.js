
const APISH_BASE_URL = "https://api.api.sh";

function jsonResponse(statusCode, body) {
    return {
        statusCode,
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    };
}

function getProductName(item) {
    return (
        item.name ||
        item.title ||
        item.product_name ||
        item.productName ||
        ""
    );
}

function getProductPrice(item) {
    const possiblePrices = [
        item.offer_price,
        item.selling_price,
        item.sale_price,
        item.final_price,
        item.price,
        item.mrp
    ];

    for (const value of possiblePrices) {
        const price = Number(
            String(value ?? "").replace(/[₹,\s]/g, "")
        );

        if (Number.isFinite(price) && price > 0) {
            return price;
        }
    }

    return null;
}

function getProductLink(item) {
    return (
        item.url ||
        item.product_url ||
        item.productUrl ||
        item.link ||
        item.product_link ||
        ""
    );
}

function getProductId(item) {
    return (
        item.code ||
        item.uid ||
        item.item_code ||
        item.id ||
        ""
    );
}

function normalize(text) {
    return String(text || "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, " ")
        .trim()
        .split(/\s+/)
        .filter(Boolean);
}

function findBestMatch(products, searchName) {
    const searchTokens = normalize(searchName);

    if (!searchTokens.length) {
        return null;
    }

    let bestProduct = null;
    let bestScore = 0;

    for (const product of products) {
        const productTokens = normalize(getProductName(product));

        if (!productTokens.length) {
            continue;
        }

        const matchingTokens = searchTokens.filter(token =>
            productTokens.includes(token)
        );

        const score = matchingTokens.length / searchTokens.length;

        if (score > bestScore) {
            bestScore = score;
            bestProduct = product;
        }
    }

    return bestScore >= 0.5 ? bestProduct : null;
}

async function searchApiSh(platform, query, apiKey) {
    const url = new URL(
        `${APISH_BASE_URL}/${platform}/v1/search`
    );

    url.searchParams.set("q", query);
    url.searchParams.set("page", "1");

    const response = await fetch(url, {
        headers: {
            "x-api-key": apiKey,
            "Accept": "application/json"
        }
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            `${platform} API returned HTTP ${response.status}`
        );
    }

    const products =
        data.products ||
        data.data?.products ||
        data.results ||
        data.data?.results ||
        [];

    return Array.isArray(products) ? products : [];
}

async function getCromaPrice(product, priceGridKey) {
    const productId = getProductId(product);

    if (!productId || !priceGridKey) {
        return null;
    }

    const pincode = process.env.PRICEGRID_PINCODE || "50032";

    const url =
        `https://pricegridapi.com/v1/croma/product/` +
        `${encodeURIComponent(productId)}` +
        `?pincode=${encodeURIComponent(pincode)}`;

    const response = await fetch(url, {
        headers: {
            "X-API-Key": priceGridKey,
            "Accept": "application/json"
        }
    });

    if (!response.ok) {
        throw new Error(
            `PriceGrid returned HTTP ${response.status}`
        );
    }

    const data = await response.json();

    return (
        getProductPrice(data) ||
        getProductPrice(data.data || {}) ||
        getProductPrice(data.product || {}) ||
        null
    );
}

exports.handler = async (event) => {
    if (event.httpMethod !== "GET") {
        return jsonResponse(405, {
            success: false,
            message: "Method not allowed"
        });
    }

    const query =
        event.queryStringParameters?.query?.trim();

    if (!query) {
        return jsonResponse(400, {
            success: false,
            message: "Product name is required"
        });
    }

    const apiKey = process.env.APISH_API_KEY;
    const priceGridKey = process.env.PRICEGRID_API_KEY;

    if (!apiKey) {
        return jsonResponse(503, {
            success: false,
            message: "API.SH is not configured in Netlify"
        });
    }

    const stores = [
        {
            name: "Croma",
            price: null,
            available: false,
            link: "",
            productName: "",
            source: "API.SH / PriceGrid"
        },
        {
            name: "Reliance Digital",
            price: null,
            available: false,
            link: "",
            productName: "",
            source: "API.SH"
        }
    ];

    const errors = [];

    try {
        const [cromaResult, relianceResult] =
            await Promise.allSettled([
                searchApiSh("croma", query, apiKey),
                searchApiSh("reliancedigital", query, apiKey)
            ]);

        // CROMA
        if (cromaResult.status === "fulfilled") {
            const cromaProduct = findBestMatch(
                cromaResult.value,
                query
            );

            if (cromaProduct) {
                stores[0].productName =
                    getProductName(cromaProduct);

                stores[0].link =
                    getProductLink(cromaProduct);

                let cromaPrice = null;

                try {
                    cromaPrice = await getCromaPrice(
                        cromaProduct,
                        priceGridKey
                    );
                } catch (error) {
                    console.error(
                        "Croma PriceGrid error:",
                        error.message
                    );
                }

                // Use API.SH price if PriceGrid has no price.
                stores[0].price =
                    cromaPrice ||
                    getProductPrice(cromaProduct);

                stores[0].available =
                    stores[0].price !== null;
            }
        } else {
            errors.push(
                "Croma search: " + cromaResult.reason.message
            );
        }

        // RELIANCE DIGITAL
        if (relianceResult.status === "fulfilled") {
            const relianceProduct = findBestMatch(
                relianceResult.value,
                query
            );

            if (relianceProduct) {
                stores[1].productName =
                    getProductName(relianceProduct);

                stores[1].price =
                    getProductPrice(relianceProduct);

                stores[1].link =
                    getProductLink(relianceProduct);

                stores[1].available =
                    stores[1].price !== null;
            }
        } else {
            errors.push(
                "Reliance Digital search: " +
                relianceResult.reason.message
            );
        }

        return jsonResponse(200, {
            success: true,
            query,
            stores,
            errors
        });

    } catch (error) {
        console.error(
            "Retailer search error:",
            error.message
        );

        return jsonResponse(500, {
            success: false,
            message: "Unable to search retailer products"
        });
    }
};
