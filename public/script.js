
// ==========================================
// PRICEWISE - PRODUCT DATA
// ==========================================

const products = [
    {
        id: 1,
        name: "HP Laptop",
        category: "Electronics",
        price: 49999,
        image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500",
        stores: [
            { name: "Amazon", price: 48999 },
            { name: "Flipkart", price: 49999 },
            { name: "Croma", price: 49999 },
            { name: "Reliance Digital", price: 49500 }
        ]
    },
    {
        id: 2,
        name: "Smartphone",
        category: "Mobiles",
        price: 19999,
        image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500",
        stores: [
            { name: "Amazon", price: 18999 },
            { name: "Flipkart", price: 19499 },
            { name: "Croma", price: 19999 },
            { name: "Reliance Digital", price: 19500 }
        ]
    },
    {
        id: 3,
        name: "Headphones",
        category: "Accessories",
        price: 1499,
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500",
        stores: [
            { name: "Amazon", price: 1399 },
            { name: "Flipkart", price: 1499 },
            { name: "Croma", price: 1599 },
            { name: "Reliance Digital", price: 1450 }
        ]
    },
    {
        id: 4,
        name: "Smart Watch",
        category: "Accessories",
        price: 2499,
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500",
        stores: [
            { name: "Amazon", price: 2299 },
            { name: "Flipkart", price: 2399 },
            { name: "Croma", price: 2499 },
            { name: "Reliance Digital", price: 2450 }
        ]
    },
    {
        id: 5,
        name: "Wireless Mouse",
        category: "Accessories",
        price: 799,
        image: "mouse.webp",
        stores: [
            { name: "Amazon", price: 699 },
            { name: "Flipkart", price: 749 },
            { name: "Croma", price: 799 },
            { name: "Reliance Digital", price: 750 }
        ]
    },
    {
        id: 6,
        name: "Gaming Keyboard",
        category: "Electronics",
        price: 999,
        image: "keyboard_og.jpg",
        stores: [
            { name: "Amazon", price: 899 },
            { name: "Flipkart", price: 949 },
            { name: "Croma", price: 999 },
            { name: "Reliance Digital", price: 950 }
        ]
    },
    {
        id: 7,
        name: "Bluetooth Speaker",
        category: "Electronics",
        price: 1299,
        image: "81HSo6wX54L._AC_SL1500_.jpg",
        stores: [
            { name: "Amazon", price: 1199 },
            { name: "Flipkart", price: 1249 },
            { name: "Croma", price: 1299 },
            { name: "Reliance Digital", price: 1250 }
        ]
    }
];


// ==========================================
// CURRENT PRODUCT DATA
// ==========================================

let currentProducts = [...products];


// ==========================================
// GET HTML ELEMENTS
// ==========================================

const productContainer =
    document.getElementById("productContainer");

const searchInput =
    document.getElementById("searchInput");

const searchButton =
    document.getElementById("searchButton");

const categoryFilter =
    document.getElementById("categoryFilter");

const sortFilter =
    document.getElementById("sortFilter");

const comparisonSection =
    document.getElementById("comparisonSection");

const comparisonProductName =
    document.getElementById("comparisonProductName");

const comparisonResult =
    document.getElementById("comparisonResult");


// ==========================================
// HELPER FUNCTIONS
// ==========================================

function escapeHTML(value) {

    return String(value ?? "").replace(/[&<>"']/g, function(char) {

        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return entities[char];

    });

}


function safeURL(value) {

    try {

        const url = new URL(value);

        if (
            url.protocol === "https:" ||
            url.protocol === "http:"
        ) {
            return escapeHTML(url.href);
        }

        return "";

    } catch {

        return "";

    }

}


function formatPrice(price) {

    return Number(price).toLocaleString("en-IN");

}


// ==========================================
// PRICEGRID PRODUCT MAPPING
// ==========================================

// Add exact matching product IDs here when you
// want to compare another Croma/Reliance product.

const priceGridProductCatalog = [

    {
        match: function(productName) {

            const name = productName.toLowerCase();

            return (
                /iphone\s*17/.test(name) &&
                /256\s*gb|256gb/.test(name) &&
                /black/.test(name)
            );

        },

        products: [

            {
                name: "Croma",
                platform: "croma",
                pid: "324530"
            },

            {
                name: "Reliance Digital",
                platform: "reliancedigital",
                pid: "9391619"
            }

        ]

    }

];


// ==========================================
// PRICEGRID REQUEST CACHE
// ==========================================

// Avoid repeated requests during this page session.

const priceGridCache = new Map();


async function getPriceGridPrice(store) {

    const cacheKey =
        store.platform + "-" + store.pid;

    if (priceGridCache.has(cacheKey)) {

        return priceGridCache.get(cacheKey);

    }

    const request = (async function() {

        try {

            const response = await fetch(
                `/.netlify/functions/pricegrid-product?platform=${encodeURIComponent(store.platform)}&pid=${encodeURIComponent(store.pid)}`
            );

            const result = await response.json();

            const price = Number(result.data?.price);

            if (
                !response.ok ||
                !result.success ||
                result.data?.available !== true ||
                result.data?.price == null ||
                !Number.isFinite(price) ||
                price <= 0
            ) {

                return {

                    name: store.name,
                    price: null,
                    link: result.data?.url || "",
                    available: false

                };

            }

            return {

                name: store.name,
                price: price,
                link: result.data.url || "",
                available: true

            };

        } catch (error) {

            console.error(
                "PriceGrid error:",
                store.name,
                error
            );

            return {

                name: store.name,
                price: null,
                link: "",
                available: false

            };

        }

    })();

    priceGridCache.set(cacheKey, request);

    return request;

}


// ==========================================
// ADD PRICEGRID PRICES TO A PRODUCT
// ==========================================

async function enrichWithPriceGrid(product) {

    const mapping = priceGridProductCatalog.find(function(item) {

        return item.match(product.name);

    });

    // If product IDs are not mapped,
    // do not make unnecessary API calls.

    if (!mapping) {

        return product;

    }

    console.log(
        "Fetching PriceGrid prices for:",
        product.name
    );

    const priceGridStores = await Promise.all(

        mapping.products.map(getPriceGridPrice)

    );

    // Remove any previous PriceGrid entries
    // before adding the latest results.

    const existingStores = (product.stores || []).filter(function(store) {

        return (
            store.name !== "Croma" &&
            store.name !== "Reliance Digital"
        );

    });

    product.stores = [
        ...existingStores,
        ...priceGridStores
    ];

    return product;

}


// ==========================================
// DISPLAY PRODUCTS
// ==========================================

function displayProducts(productList) {

    productContainer.innerHTML = "";

    if (productList.length === 0) {

        productContainer.innerHTML =
            "<p class='no-products'>No products found!</p>";

        return;

    }

    productList.forEach(function(product) {

        const productCard = document.createElement("div");

        productCard.className = "product-card";

        const imageURL = safeURL(product.image);

        const buyLink = safeURL(product.buyLink);

        productCard.innerHTML = `

            <div class="product-image">

                <img
                    src="${imageURL}"
                    alt="${escapeHTML(product.name)}"
                    onerror="this.style.display='none'"
                >

            </div>

            <div class="product-details">

                <span class="category-label">
                    ${escapeHTML(product.category)}
                </span>

                <h3>${escapeHTML(product.name)}</h3>

                <p class="price">
                    ₹${formatPrice(product.price)}
                </p>

                ${product.rating
                    ? `<p>⭐ ${escapeHTML(product.rating)}</p>`
                    : ""
                }

                <button
                    class="compare-btn"
                    type="button"
                    data-product-id="${escapeHTML(product.id)}">

                    Compare Prices

                </button>

                ${buyLink ? `

                    <a
                        href="${buyLink}"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="buy-btn">

                        Buy on Flipkart

                    </a>

                ` : ""}

                <button
                    class="wishlist-btn"
                    type="button"
                    data-product-id="${escapeHTML(product.id)}">

                    ❤️ Add to Wishlist

                </button>

            </div>

        `;

        productContainer.appendChild(productCard);

    });

}


// ==========================================
// FLIPKART LIVE PRODUCT SEARCH
// ==========================================

async function searchFlipkartProducts() {

    const searchValue = searchInput.value.trim();

    if (!searchValue) {

        alert("Please enter a product name!");

        return;

    }

    searchButton.disabled = true;

    searchButton.textContent = "Searching...";

    productContainer.innerHTML =
        "<p>Searching Flipkart products...</p>";

    try {

        // Existing QuickCommerce integration.
        // This request is intentionally unchanged.

        const response = await fetch(
            `/api/products/search?q=${encodeURIComponent(searchValue)}&platform=Flipkart`
        );

        const result = await response.json();

        if (!response.ok || !result.success) {

            throw new Error(
                result.message || "Unable to fetch products"
            );

        }

        const apiProducts =
            result.data?.data?.products || [];

        // Convert Flipkart results into PriceWise format.

        const flipkartProducts = apiProducts.map(function(item, index) {

            const image = Array.isArray(item.images)
                ? item.images[0]
                : item.images || item.image_url || "";

            const price = Number(
                item.offer_price ?? item.mrp ?? 0
            );

            return {

                id: "flipkart-" + (item.id || index),

                name: item.name || "Unnamed Product",

                category: item.category || "Flipkart",

                price: price,

                image: image,

                rating: item.rating || null,

                buyLink: item.deeplink || "",

                stores: [

                    {
                        name: "Flipkart",
                        price: price,
                        link: item.deeplink || ""
                    }

                ]

            };

        });


        // ==========================================
        // FETCH PRICEGRID PRICES IMMEDIATELY
        // ==========================================

        if (flipkartProducts.length > 0) {

            productContainer.innerHTML = `
                <p>
                    Products found! Checking Croma and
                    Reliance Digital prices...
                </p>
            `;

            await Promise.all(

                flipkartProducts.map(enrichWithPriceGrid)

            );

        }


        // Replace sample products with live results.

        currentProducts = flipkartProducts;

        // Reset filters.

        categoryFilter.value = "all";

        sortFilter.value = "default";

        // Display updated products.

        displayProducts(flipkartProducts);

        if (flipkartProducts.length === 0) {

            productContainer.innerHTML =
                "<p class='no-products'>No Flipkart products found!</p>";

        }

        // Hide old comparison results.

        comparisonSection.hidden = true;

    } catch (error) {

        console.error("Product Search Error:", error);

        productContainer.innerHTML = `

            <p class="no-products">

                ${escapeHTML(error.message)}

            </p>

        `;

    } finally {

        searchButton.disabled = false;

        searchButton.textContent = "Search";

    }

}


// ==========================================
// SEARCH, FILTER AND SORT
// ==========================================

function updateProducts() {

    const searchValue =
        searchInput.value.toLowerCase().trim();

    const selectedCategory =
        categoryFilter.value;

    const sortValue =
        sortFilter.value;

    let result = currentProducts.filter(function(product) {

        return product.name
            .toLowerCase()
            .includes(searchValue);

    });

    if (selectedCategory !== "all") {

        result = result.filter(function(product) {

            return product.category === selectedCategory;

        });

    }

    if (sortValue === "low") {

        result.sort(function(a, b) {

            return a.price - b.price;

        });

    } else if (sortValue === "high") {

        result.sort(function(a, b) {

            return b.price - a.price;

        });

    } else if (sortValue === "az") {

        result.sort(function(a, b) {

            return a.name.localeCompare(b.name);

        });

    }

    displayProducts(result);

}


// ==========================================
// WISHLIST
// ==========================================

function getWishlist() {

    try {

        return JSON.parse(
            localStorage.getItem("wishlist")
        ) || [];

    } catch {

        return [];

    }

}


function addToWishlist(productId) {

    const product = currentProducts.find(function(item) {

        return String(item.id) === String(productId);

    });

    if (!product) {

        alert("Product not found!");

        return;

    }

    let wishlist = getWishlist();

    const alreadyExists = wishlist.some(function(item) {

        return String(item.id) === String(productId);

    });

    if (alreadyExists) {

        alert("Product is already in your wishlist!");

        return;

    }

    wishlist.push(product);

    localStorage.setItem(
        "wishlist",
        JSON.stringify(wishlist)
    );

    alert(product.name + " added to wishlist!");

}


// ==========================================
// PRICE COMPARISON
// ==========================================

function comparePrices(productId) {

    const product = currentProducts.find(function(item) {

        return String(item.id) === String(productId);

    });

    if (!product) {

        alert("Product not found!");

        return;

    }

    const stores = product.stores || [];

    if (stores.length === 0) {

        alert("No store prices available!");

        return;

    }

    // Only use valid, positive prices.

    const availableStores = stores.filter(function(store) {

        return (
            store.price !== null &&
            store.price !== undefined &&
            Number.isFinite(Number(store.price)) &&
            Number(store.price) > 0
        );

    });

    // Find cheapest store.

    const cheapestStore = availableStores.length > 0

        ? availableStores.reduce(function(min, store) {

            return Number(store.price) < Number(min.price)
                ? store
                : min;

        })

        : null;


    // Find highest price.

    const highestPrice = availableStores.length > 0

        ? Math.max(
            ...availableStores.map(function(store) {
                return Number(store.price);
            })
        )

        : null;


    // Calculate savings only when two or more
    // valid store prices are available.

    const savings = availableStores.length > 1

        ? highestPrice - Number(cheapestStore.price)

        : 0;


    comparisonSection.hidden = false;

    comparisonProductName.textContent = product.name;

    comparisonResult.innerHTML = `

        <table class="comparison-table">

            <thead>

                <tr>
                    <th>Store</th>
                    <th>Price</th>
                    <th>Status</th>
                </tr>

            </thead>

            <tbody>

                ${stores.map(function(store) {

                    const isAvailable =
                        store.price !== null &&
                        store.price !== undefined &&
                        Number.isFinite(Number(store.price)) &&
                        Number(store.price) > 0;

                    const isCheapest =
                        isAvailable &&
                        cheapestStore &&
                        Number(store.price) === Number(cheapestStore.price);

                    const link = safeURL(store.link);

                    return `

                        <tr>

                            <td>

                                ${link ? `

                                    <a
                                        href="${link}"
                                        target="_blank"
                                        rel="noopener noreferrer">

                                        ${escapeHTML(store.name)}

                                    </a>

                                ` : escapeHTML(store.name)}

                            </td>

                            <td>

                                ${isAvailable
                                    ? "₹" + formatPrice(store.price)
                                    : "Currently unavailable"
                                }

                            </td>

                            <td>

                                ${!isAvailable
                                    ? "Unavailable"
                                    : isCheapest
                                        ? "Cheapest Price"
                                        : "Available"
                                }

                            </td>

                        </tr>

                    `;

                }).join("")}

            </tbody>

        </table>

        ${cheapestStore ? `

            <p class="best-deal">

                Best Deal: ${escapeHTML(cheapestStore.name)}

            </p>

            ${availableStores.length > 1 ? `

                <p class="savings">

                    You can save ₹${formatPrice(savings)}

                </p>

            ` : `

                <p class="savings">

                    Only one store has a valid price.

                </p>

            `}

        ` : `

            <p class="best-deal">

                No live store prices are currently available.

            </p>

        `}

    `;

    comparisonSection.scrollIntoView({

        behavior: "smooth"

    });

}


// ==========================================
// BUTTON CLICK EVENTS
// ==========================================

productContainer.addEventListener("click", function(event) {

    const compareButton =
        event.target.closest(".compare-btn");

    if (compareButton) {

        const productId =
            compareButton.dataset.productId;

        comparePrices(productId);

        return;

    }

    const wishlistButton =
        event.target.closest(".wishlist-btn");

    if (wishlistButton) {

        const productId =
            wishlistButton.dataset.productId;

        addToWishlist(productId);

    }

});


// ==========================================
// EVENT LISTENERS
// ==========================================

searchButton.addEventListener(
    "click",
    searchFlipkartProducts
);


searchInput.addEventListener("keydown", function(event) {

    if (event.key === "Enter") {

        searchFlipkartProducts();

    }

});


searchInput.addEventListener(
    "input",
    updateProducts
);


categoryFilter.addEventListener(
    "change",
    updateProducts
);


sortFilter.addEventListener(
    "change",
    updateProducts
);


// ==========================================
// INITIAL WEBSITE LOAD
// ==========================================

displayProducts(currentProducts);
