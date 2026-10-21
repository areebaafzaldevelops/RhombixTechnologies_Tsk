// ===============================
// BiteHub - Main JavaScript
// ===============================


// ===============================
// CART
// ===============================

function getCart() {
    return JSON.parse(localStorage.getItem("bitehubCart")) || [];
}


function saveCart(cart) {
    localStorage.setItem("bitehubCart", JSON.stringify(cart));
    updateCartCount();
}


function updateCartCount() {

    const cart = getCart();

    let totalItems = 0;

    cart.forEach(function(item) {
        totalItems += Number(item.quantity) || 0;
    });

    // Your HTML uses cart-count
    const cartCount = document.getElementById("cart-count");

    if (cartCount) {
        cartCount.textContent = totalItems;
    }
}


// ===============================
// ADD TO CART
// ===============================

function addToCart(name, price) {

    const loggedIn =
        localStorage.getItem("bitehubLoggedIn") === "true";

    if (!loggedIn) {
        alert("Please login first!");
        window.location.href = "login.html";
        return;
    }

    let cart = getCart();

    price = Number(price);

    const existingItem = cart.find(function(item) {
        return item.name === name;
    });

    if (existingItem) {

        existingItem.quantity =
            Number(existingItem.quantity) + 1;

    } else {

        cart.push({
            name: name,
            price: price,
            quantity: 1
        });
    }

    saveCart(cart);

    updateCartCount();

    alert(name + " added to cart!");
}


// ===============================
// REMOVE FROM CART
// ===============================

function removeFromCart(name) {

    let cart = getCart();

    cart = cart.filter(function(item) {
        return item.name !== name;
    });

    saveCart(cart);

    displayCart();
}


// ===============================
// CHANGE QUANTITY
// ===============================

function changeQuantity(name, change) {

    let cart = getCart();

    const item = cart.find(function(item) {
        return item.name === name;
    });

    if (!item) {
        return;
    }

    item.quantity =
        Number(item.quantity) + Number(change);

    if (item.quantity <= 0) {

        cart = cart.filter(function(item) {
            return item.name !== name;
        });
    }

    saveCart(cart);

    displayCart();
}


// ===============================
// CLEAR CART
// ===============================

function clearCart() {

    localStorage.removeItem("bitehubCart");

    updateCartCount();

    displayCart();
}


// ===============================
// DISPLAY CART
// ===============================

function displayCart() {

    const cartContainer =
        document.getElementById("cartItems");

    if (!cartContainer) {
        return;
    }

    const cart = getCart();

    if (cart.length === 0) {

        cartContainer.innerHTML = `
            <div style="text-align:center; padding:40px;">
                <h2>Your cart is empty 🛒</h2>
                <p>Add some delicious food!</p>
            </div>
        `;

        updateCartTotal();

        return;
    }


    cartContainer.innerHTML = cart.map(function(item) {

        const quantity = Number(item.quantity) || 1;
        const price = Number(item.price) || 0;

        return `
            <div class="cart-item">

                <div class="cart-item-info">
                    <h3>${item.name}</h3>
                    <p>Rs. ${price}</p>
                </div>

                <div class="cart-quantity">

                    <button onclick="changeQuantity('${item.name}', -1)">
                        −
                    </button>

                    <span>${quantity}</span>

                    <button onclick="changeQuantity('${item.name}', 1)">
                        +
                    </button>

                </div>

                <div class="cart-item-total">
                    Rs. ${price * quantity}
                </div>

                <button
                    class="remove-btn"
                    onclick="removeFromCart('${item.name}')">

                    Remove

                </button>

            </div>
        `;

    }).join("");

    updateCartTotal();
}


// ===============================
// CART TOTAL
// ===============================

function updateCartTotal() {

    const cart = getCart();

    let total = 0;

    cart.forEach(function(item) {

        const price = Number(item.price) || 0;
        const quantity = Number(item.quantity) || 0;

        total += price * quantity;

    });


    const totalElement =
        document.getElementById("cartTotal");

    if (totalElement) {
        totalElement.textContent = "Rs. " + total;
    }
}


// ===============================
// FAVORITE
// ===============================

function toggleFavorite(button) {

    if (button) {
        button.classList.toggle("active");
    }

}


// ===============================
// LOGOUT
// ===============================

function logout() {

    localStorage.removeItem("bitehubLoggedIn");
    localStorage.removeItem("bitehubUserEmail");
    localStorage.removeItem("bitehubUserName");
    localStorage.removeItem("bitehubArea");

    alert("You have been logged out!");

    window.location.href = "login.html";
}


// ===============================
// CHECKOUT
// ===============================

function checkout() {

    const cart = getCart();

    if (cart.length === 0) {

        alert("Your cart is empty!");

        return;
    }


    const loggedIn =
        localStorage.getItem("bitehubLoggedIn") === "true";


    if (!loggedIn) {

        alert("Please login first!");

        window.location.href = "login.html";

        return;
    }


    alert("Order placed successfully! 🎉");

    localStorage.removeItem("bitehubCart");

    updateCartCount();

    displayCart();
}


// ===============================
// LOGIN BUTTON
// ===============================

function setupLoginButton() {

    const loginButton =
        document.querySelector(".login-btn");

    if (loginButton) {

        loginButton.addEventListener("click", function(event) {

            event.preventDefault();

            const loggedIn =
                localStorage.getItem("bitehubLoggedIn") === "true";

            if (loggedIn) {

                const userName =
                    localStorage.getItem("bitehubUserName") || "User";

                const logoutNow =
                    confirm(
                        "You are logged in as " +
                        userName +
                        ".\n\nDo you want to logout?"
                    );

                if (logoutNow) {
                    logout();
                }

            } else {

                window.location.href = "login.html";

            }

        });

    }

}


// ===============================
// CART PAGE PROTECTION
// ===============================

function protectCartPage() {

    const loggedIn =
        localStorage.getItem("bitehubLoggedIn") === "true";

    const currentPage =
        window.location.pathname.toLowerCase();

    if (
        currentPage.includes("cart.html") &&
        !loggedIn
    ) {

        alert("Please login first!");

        window.location.href = "login.html";
    }

}


// ===============================
// PAGE LOAD
// ===============================

document.addEventListener("DOMContentLoaded", function() {

    updateCartCount();

    setupLoginButton();

    protectCartPage();

    displayCart();

});