
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
            { name: "Flipkart", price: 49999 }
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
            { name: "Flipkart", price: 19499 }
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
            { name: "Flipkart", price: 1499 }
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
            { name: "Flipkart", price: 2399 }
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
            { name: "Flipkart", price: 749 }
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
            { name: "Flipkart", price: 949 }
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
            { name: "Flipkart", price: 1249 }
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


function isValidPrice(price) {

    return (
        price !== null &&
        price !== undefined &&
        price !== "" &&
        Number.isFinite(Number(price)) &&
        Number(price) > 0
    );

}


// ==========================================
// DISPLAY PRODUCTS
// ==========================================

function displayProducts(productList) {

    productContainer.innerHTML = "";

    if (!productList || productList.length === 0) {

        productContainer.innerHTML =
            "<p class='no-products'>No products found!</p>";

        return;

    }

    productList.forEach(function(product) {

        const productCard = document.createElement("div");

        productCard.className = "product-card";

        const imageURL = safeURL(product.image);

        const buyLink = safeURL(product.buyLink);

        const displayedPrice = isValidPrice(product.price)
            ? "₹" + formatPrice(product.price)
            : "Price unavailable";

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
                    ${displayedPrice}
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
// QUICKCOMMERCE API
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

    comparisonSection.hidden = true;

    try {

        // Existing QuickCommerce integration.
        // API key remains securely on Netlify.

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

        // Convert API results into PriceWise format.

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

                category: item.category || "Electronics",

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

        console.log(
            "Flipkart products loaded:",
            flipkartProducts
        );

        currentProducts = flipkartProducts;

        categoryFilter.value = "all";

        sortFilter.value = "default";

        displayProducts(flipkartProducts);

        if (flipkartProducts.length === 0) {

            productContainer.innerHTML =
                "<p class='no-products'>No Flipkart products found!</p>";

        }

    } catch (error) {

        console.error("Product Search Error:", error);

        productContainer.innerHTML = `

            <p class="no-products">
                ${escapeHTML(error.message)}
            </p>

        `;

    } finally {

        searchButton.disabled = false;

        searchButton.textContent = "Search 🔍";

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

            return Number(a.price) - Number(b.price);

        });

    } else if (sortValue === "high") {

        result.sort(function(a, b) {

            return Number(b.price) - Number(a.price);

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
// AUTOMATIC CROMA AND RELIANCE SEARCH
// NETLIFY RETAILER-SEARCH FUNCTION
// ==========================================

async function searchOtherRetailers(productName) {

    const response = await fetch(
        `/api/retailer-search?query=${encodeURIComponent(productName)}`
    );

    const result = await response.json();

    console.log("Automatic retailer search result:", result);

    if (!response.ok || !result.success) {

        throw new Error(
            result.message || "Unable to search other retailers."
        );

    }

    return Array.isArray(result.stores)
        ? result.stores
        : [];

}


// ==========================================
// PRICE COMPARISON
// FLIPKART + CROMA + RELIANCE DIGITAL
// ==========================================

async function comparePrices(productId) {

    const product = currentProducts.find(function(item) {

        return String(item.id) === String(productId);

    });

    if (!product) {

        alert("Product not found!");

        return;

    }

    comparisonSection.hidden = false;

    comparisonProductName.textContent = product.name;

    comparisonResult.innerHTML = `

        <p>
            Searching Croma and Reliance Digital automatically...
        </p>

    `;

    comparisonSection.scrollIntoView({
        behavior: "smooth"
    });

    // Keep Amazon and Flipkart entries.
    // Remove previous retailer results before refreshing.

    let stores = (product.stores || []).filter(function(store) {

        return (
            store.name !== "Croma" &&
            store.name !== "Reliance Digital"
        );

    });

    try {

        // Automatically search Croma and Reliance Digital.

        const retailerStores =
            await searchOtherRetailers(product.name);

        stores = [
            ...stores,
            ...retailerStores
        ];

    } catch (error) {

        console.error(
            "Automatic retailer search error:",
            error
        );

        stores.push(
            {
                name: "Croma",
                price: null,
                available: false,
                link: "",
                source: "Search failed"
            },
            {
                name: "Reliance Digital",
                price: null,
                available: false,
                link: "",
                source: "Search failed"
            }
        );

    }

    // Update product stores.

    product.stores = stores;

    // Only compare valid prices.

    const availableStores = stores.filter(function(store) {

        return isValidPrice(store.price);

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

    // Calculate savings.

    const savings = availableStores.length > 1

        ? highestPrice - Number(cheapestStore.price)

        : 0;

    // Display comparison table.

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

                    const available = isValidPrice(store.price);

                    const isCheapest =
                        available &&
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

                                ${store.productName ? `

                                    <br>

                                    <small>
                                        ${escapeHTML(store.productName)}
                                    </small>

                                ` : ""}

                            </td>

                            <td>

                                ${available
                                    ? "₹" + formatPrice(store.price)
                                    : "Currently unavailable"
                                }

                            </td>

                            <td>

                                ${!available
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

                No valid store prices are currently available.

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

// Search button.

searchButton.addEventListener(
    "click",
    searchFlipkartProducts
);


// Search using Enter key.

searchInput.addEventListener("keydown", function(event) {

    if (event.key === "Enter") {

        searchFlipkartProducts();

    }

});


// Search, filter and sort.

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
