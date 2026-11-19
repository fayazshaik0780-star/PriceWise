
exports.handler = async (event) => {

    // Allow only GET requests
    if (event.httpMethod !== "GET") {
        return {
            statusCode: 405,
            body: JSON.stringify({
                success: false,
                message: "Method not allowed"
            })
        };
    }

    try {

        const {
            platform,
            pid,
            productUrl
        } = event.queryStringParameters || {};

        const allowedPlatforms = [
            "croma",
            "reliancedigital"
        ];

        if (!allowedPlatforms.includes(platform)) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    success: false,
                    message: "Platform must be croma or reliancedigital"
                })
            };
        }

        // --------------------------------
        // EXTRACT PRODUCT ID FROM URL
        // --------------------------------

        let productId = pid;

        if (!productId && productUrl) {

            let parsedUrl;

            try {
                parsedUrl = new URL(productUrl);
            } catch {
                return {
                    statusCode: 400,
                    body: JSON.stringify({
                        success: false,
                        message: "Invalid product URL"
                    })
                };
            }

            const hostname = parsedUrl.hostname.toLowerCase();

            if (platform === "croma") {

                if (
                    hostname !== "croma.com" &&
                    hostname !== "www.croma.com"
                ) {
                    return {
                        statusCode: 400,
                        body: JSON.stringify({
                            success: false,
                            message: "Please provide a valid Croma URL"
                        })
                    };
                }

                const match = parsedUrl.pathname.match(/\/p\/(\d+)/);

                productId = match ? match[1] : null;
            }

            if (platform === "reliancedigital") {

                if (
                    hostname !== "reliancedigital.in" &&
                    hostname !== "www.reliancedigital.in"
                ) {
                    return {
                        statusCode: 400,
                        body: JSON.stringify({
                            success: false,
                            message: "Please provide a valid Reliance Digital URL"
                        })
                    };
                }

                const match = parsedUrl.pathname.match(/-(\d+)\/?$/);

                productId = match ? match[1] : null;
            }
        }

        if (!productId || !/^\d+$/.test(productId)) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    success: false,
                    message: "A valid product ID or product URL is required"
                })
            };
        }

        // --------------------------------
        // GET PRICEGRID API KEY
        // --------------------------------

        const apiKey = process.env.PRICEGRID_API_KEY;

        if (!apiKey) {
            return {
                statusCode: 500,
                body: JSON.stringify({
                    success: false,
                    message: "PriceGrid API key is not configured"
                })
            };
        }

        // Delivery pincode
        const pincode = "500032";

        // --------------------------------
        // CALL PRICEGRID API
        // --------------------------------

        const apiUrl =
            `https://pricegridapi.com/v1/${platform}/product/${encodeURIComponent(productId)}?pincode=${pincode}`;

        const response = await fetch(apiUrl, {
            method: "GET",
            headers: {
                "X-API-Key": apiKey,
                "Accept": "application/json"
            }
        });

        const data = await response.json();

        return {
            statusCode: response.status,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        };

    } catch (error) {

        console.error("PriceGrid error:", error);

        return {
            statusCode: 500,
            body: JSON.stringify({
                success: false,
                message: "Unable to fetch product price"
            })
        };
    }
};
