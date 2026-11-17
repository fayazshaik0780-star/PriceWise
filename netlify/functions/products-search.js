const allowedPlatforms = new Set(["Amazon", "Flipkart"]);

function jsonResponse(statusCode, body) {
    return {
        statusCode,
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    };
}

exports.handler = async (event) => {
    if (event.httpMethod !== "GET") {
        return jsonResponse(405, {
            success: false,
            message: "Method not allowed"
        });
    }

    const { q, platform } = event.queryStringParameters || {};

    if (!q || !platform) {
        return jsonResponse(400, {
            success: false,
            message: "Product name and platform are required"
        });
    }

    if (!allowedPlatforms.has(platform)) {
        return jsonResponse(400, {
            success: false,
            message: "Unsupported platform"
        });
    }

    const { QUICKCOMMERCE_API_KEY, API_LAT, API_LON } = process.env;
    if (!QUICKCOMMERCE_API_KEY || !API_LAT || !API_LON) {
        return jsonResponse(503, {
            success: false,
            message: "Product search is not configured"
        });
    }

    const url = new URL("https://api.quickcommerceapi.com/v1/search");
    url.searchParams.set("q", q);
    url.searchParams.set("platform", platform);
    url.searchParams.set("lat", API_LAT);
    url.searchParams.set("lon", API_LON);

    try {
        const response = await fetch(url, {
            headers: {
                "X-API-Key": QUICKCOMMERCE_API_KEY,
                "Accept": "application/json"
            }
        });
        const data = await response.json();

        if (!response.ok) {
            return jsonResponse(response.status, {
                success: false,
                message: "Shopping API request failed",
                details: data
            });
        }

        return jsonResponse(200, {
            success: true,
            platform,
            data
        });
    } catch (error) {
        console.error("Product search error:", error.message);

        return jsonResponse(500, {
            success: false,
            message: "Unable to search products"
        });
    }
};
