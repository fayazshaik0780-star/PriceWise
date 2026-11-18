
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
    const { platform, pid } = event.queryStringParameters || {};

    // Check platform
    const allowedPlatforms = ["croma", "reliancedigital"];

    if (!allowedPlatforms.includes(platform)) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          message: "Platform must be croma or reliancedigital"
        })
      };
    }

    // Check product ID
    if (!pid) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          success: false,
          message: "Product ID (pid) is required"
        })
      };
    }

    // Get API key securely from Netlify
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

    // PriceGrid API URL
    const apiUrl =
      `https://pricegridapi.com/v1/${platform}/product/${encodeURIComponent(pid)}?pincode=${pincode}`;

    // Call PriceGrid API
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
