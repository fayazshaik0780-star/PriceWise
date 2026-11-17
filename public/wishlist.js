// Select wishlist container

const wishlistContainer =
    document.getElementById("wishlistContainer");


// Get saved wishlist

function getWishlist() {

    return JSON.parse(localStorage.getItem("wishlist")) || [];

}


// Display wishlist products

function displayWishlist() {

    const wishlist = getWishlist();

    wishlistContainer.innerHTML = "";

    // Check if wishlist is empty

    if (wishlist.length === 0) {

        wishlistContainer.innerHTML = `
            <p class="no-products">
                Your wishlist is empty!
            </p>
        `;

        return;
    }

    // Display saved products

    wishlist.forEach(function(product) {

        const productCard = document.createElement("div");

        productCard.className = "product-card";

        productCard.innerHTML = `
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}">
            </div>

            <div class="product-details">

                <span class="category-label">
                    ${product.category}
                </span>

                <h3>${product.name}</h3>

                <p class="price">
                    ₹${product.price.toLocaleString("en-IN")}
                </p>

                <button
                    class="remove-btn"
                    data-product-id="${product.id}">
                    Remove
                </button>

            </div>
        `;

        wishlistContainer.appendChild(productCard);

    });

}


// Remove product from wishlist

function removeFromWishlist(productId) {

    let wishlist = getWishlist();

    wishlist = wishlist.filter(function(product) {

        return product.id !== productId;

    });

    localStorage.setItem("wishlist", JSON.stringify(wishlist));

    displayWishlist();

}


// Handle Remove button clicks

wishlistContainer.addEventListener("click", function(event) {

    const removeButton = event.target.closest(".remove-btn");

    if (!removeButton) {
        return;
    }

    const productId = Number(removeButton.dataset.productId);

    removeFromWishlist(productId);

});


// Display wishlist when page loads

displayWishlist();