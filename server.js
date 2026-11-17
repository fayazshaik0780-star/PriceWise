
const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// Serve frontend files
app.use(express.static(path.join(__dirname, "public")));

// Health check API
app.get("/api/health", (req, res) => {
    res.json({
        message: "PriceWise Backend is running!"
    });
});

// Start server
const PORT = process.env.PORT || 3000;


// QuickCommerce product search API

app.get("/api/products/search", async (req, res) => {
    try {
        const { q, platform } = req.query;

        if (!q || !platform) {
            return res.status(400).json({
                success: false,
                message: "Product name and platform are required"
            });
        }

        const allowedPlatforms = ["Amazon", "Flipkart"];

        if (!allowedPlatforms.includes(platform)) {
            return res.status(400).json({
                success: false,
                message: "Unsupported platform"
            });
        }

        const url = new URL(
            "https://api.quickcommerceapi.com/v1/search"
        );

        url.searchParams.set("q", q);
        url.searchParams.set("platform", platform);
        url.searchParams.set("lat", process.env.API_LAT);
        url.searchParams.set("lon", process.env.API_LON);

        const response = await fetch(url, {
            headers: {
                "X-API-Key": process.env.QUICKCOMMERCE_API_KEY,
                "Accept": "application/json"
            }
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({
                success: false,
                message: "Shopping API request failed",
                details: data
            });
        }

        res.json({
            success: true,
            platform,
            data
        });

    } catch (error) {
        console.error("Product search error:", error.message);

        res.status(500).json({
            success: false,
            message: "Unable to search products"
        });
    }
});

app.listen(PORT, () => {
    console.log(`PriceWise running at http://localhost:${PORT}`);
});
