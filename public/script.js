
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

// Initially show sample products.
// After searching, replace them with API results.

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

// Safely display text received from the API.

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


// Allow only HTTP and HTTPS links.

function safeURL(value) {
    try {
        const url = new URL(value);

        if (url.protocol === "https:" || url.protocol === "http:") {
            return escapeHTML(url.href);
        }

        return "";
    } catch {
        return "";
    }
}


// Format Indian currency.

function formatPrice(price) {
    return Number(price).toLocaleString("en-IN");
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

        // Send request to our Node.js backend.

        const response = await fetch(
            `/api/products/search?q=${encodeURIComponent(searchValue)}&platform=Flipkart`
        );

        const result = await response.json();

        if (!response.ok || !result.success) {

            throw new Error(
                result.message || "Unable to fetch products"
            );

        }

        // IMPORTANT:
        // Backend response:
        // result.data = QuickCommerce response
        // result.data.data.products = actual products

        const apiProducts =
            result.data?.data?.products || [];

        // Convert API products into PriceWise format.

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

        // Replace sample products with live results.

        currentProducts = flipkartProducts;

        // Reset category and sorting filters.

        categoryFilter.value = "all";

        sortFilter.value = "default";

        // Display live products.

        displayProducts(flipkartProducts);

        if (flipkartProducts.length === 0) {

            productContainer.innerHTML =
                "<p class='no-products'>No Flipkart products found!</p>";

        }

        // Hide old comparison results.

        comparisonSection.hidden = true;

    } catch (error) {

        console.error("Flipkart API Error:", error);

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

    // Search products.

    let result = currentProducts.filter(function(product) {

        return product.name
            .toLowerCase()
            .includes(searchValue);

    });

    // Filter by category.

    if (selectedCategory !== "all") {

        result = result.filter(function(product) {

            return product.category === selectedCategory;

        });

    }

    // Sort by price or name.

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

    return JSON.parse(
        localStorage.getItem("wishlist")
    ) || [];

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

    const cheapestStore = stores.reduce(function(min, store) {

        return Number(store.price) < Number(min.price)
            ? store
            : min;

    });

    const highestPrice = Math.max(
        ...stores.map(function(store) {

            return Number(store.price);

        })
    );

    const savings = highestPrice - Number(cheapestStore.price);

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

                    const isCheapest =
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
                                ₹${formatPrice(store.price)}
                            </td>

                            <td>

                                ${isCheapest
                                    ? "Cheapest Price"
                                    : "Available"
                                }

                            </td>

                        </tr>

                    `;

                }).join("")}

            </tbody>

        </table>

        ${stores.length > 1 ? `

            <p class="best-deal">

                Best Deal: ${escapeHTML(cheapestStore.name)}

            </p>

            <p class="savings">

                You can save ₹${formatPrice(savings)}

            </p>

        ` : `

            <p class="best-deal">

                Current price from Flipkart.

            </p>

            <p class="savings">

                Search other stores to compare prices.

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

    // Compare Prices button.

    const compareButton =
        event.target.closest(".compare-btn");

    if (compareButton) {

        const productId =
            compareButton.dataset.productId;

        comparePrices(productId);

        return;

    }

    // Wishlist button.

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

// Search button calls live Flipkart API.

searchButton.addEventListener(
    "click",
    searchFlipkartProducts
);

// Press Enter to search.

searchInput.addEventListener("keydown", function(event) {

    if (event.key === "Enter") {

        searchFlipkartProducts();

    }

});

// Local filtering of currently loaded products.

searchInput.addEventListener(
    "input",
    updateProducts
);

// Category filtering.

categoryFilter.addEventListener(
    "change",
    updateProducts
);

// Sorting.

sortFilter.addEventListener(
    "change",
    updateProducts
);


// ==========================================
// INITIAL WEBSITE LOAD
// ==========================================

// Show original sample products initially.

displayProducts(currentProducts);

