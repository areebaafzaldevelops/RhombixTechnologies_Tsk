const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const app = express();
const PORT = 5000;


// ==========================================
// MIDDLEWARE
// ==========================================

app.use(cors());
app.use(express.json());


// ==========================================
// DATA FILES
// ==========================================

const dataFolder = path.join(__dirname, "data");

const usersFile = path.join(
    dataFolder,
    "users.json"
);

const ordersFile = path.join(
    dataFolder,
    "orders.json"
);


// Make sure data folder exists
if (!fs.existsSync(dataFolder)) {
    fs.mkdirSync(dataFolder);
}


// Make sure users.json exists
if (!fs.existsSync(usersFile)) {
    fs.writeFileSync(usersFile, "[]", "utf8");
}


// Make sure orders.json exists
if (!fs.existsSync(ordersFile)) {
    fs.writeFileSync(ordersFile, "[]", "utf8");
}


// ==========================================
// FILE FUNCTIONS
// ==========================================

function getUsers() {

    try {

        const data =
            fs.readFileSync(
                usersFile,
                "utf8"
            );

        return JSON.parse(data);

    } catch (error) {

        return [];

    }
}


function saveUsers(users) {

    fs.writeFileSync(
        usersFile,
        JSON.stringify(users, null, 2),
        "utf8"
    );

}


function getOrders() {

    try {

        const data =
            fs.readFileSync(
                ordersFile,
                "utf8"
            );

        return JSON.parse(data);

    } catch (error) {

        return [];

    }
}


function saveOrders(orders) {

    fs.writeFileSync(
        ordersFile,
        JSON.stringify(orders, null, 2),
        "utf8"
    );

}


// ==========================================
// PASSWORD HASHING
// ==========================================

function hashPassword(password) {

    const salt =
        crypto.randomBytes(16).toString("hex");

    const hash =
        crypto
            .scryptSync(password, salt, 64)
            .toString("hex");

    return `${salt}:${hash}`;

}


function verifyPassword(password, storedPassword) {

    const parts =
        storedPassword.split(":");

    if (parts.length !== 2) {
        return false;
    }

    const salt = parts[0];
    const originalHash = parts[1];

    const hash =
        crypto
            .scryptSync(password, salt, 64)
            .toString("hex");

    return hash === originalHash;

}


// ==========================================
// HOME API
// ==========================================

app.get("/", (req, res) => {

    res.json({

        success: true,

        message:
            "BiteHub API is running successfully! 🍔"

    });

});


// ==========================================
// MENU
// ==========================================

const menuItems = [

    {
        id: 1,
        name: "Classic Beef Burger",
        category: "Burgers",
        price: 650
    },

    {
        id: 2,
        name: "Ultimate Cheese Burger",
        category: "Burgers",
        price: 750
    },

    {
        id: 3,
        name: "Pepperoni Pizza",
        category: "Pizzas",
        price: 1250
    },

    {
        id: 4,
        name: "Margherita Pizza",
        category: "Pizzas",
        price: 1050
    },

    {
        id: 5,
        name: "Loaded Cheese Fries",
        category: "Fries",
        price: 450
    },

    {
        id: 6,
        name: "BBQ Chicken Wings",
        category: "Wings",
        price: 720
    },

    {
        id: 7,
        name: "Special Chicken Roll",
        category: "Rolls",
        price: 400
    },

    {
        id: 8,
        name: "Coca Cola",
        category: "Drinks",
        price: 150
    },

    {
        id: 9,
        name: "Cheese Sauce",
        category: "Sauces",
        price: 120
    }

];


// Get all menu
app.get("/api/menu", (req, res) => {

    res.json({

        success: true,

        count: menuItems.length,

        items: menuItems

    });

});


// Get menu by category
app.get("/api/menu/:category", (req, res) => {

    const category =
        req.params.category.toLowerCase();

    const filteredItems =
        menuItems.filter((item) => {

            return (
                item.category.toLowerCase()
                === category
            );

        });

    res.json({

        success: true,

        count: filteredItems.length,

        items: filteredItems

    });

});


// ==========================================
// SIGN UP
// ==========================================

app.post("/api/auth/signup", (req, res) => {

    const {
        name,
        email,
        password,
        area
    } = req.body;


    if (
        !name ||
        !email ||
        !password ||
        !area
    ) {

        return res.status(400).json({

            success: false,

            message:
                "All fields are required."

        });

    }


    if (password.length < 6) {

        return res.status(400).json({

            success: false,

            message:
                "Password must be at least 6 characters."

        });

    }


    const users = getUsers();


    const existingUser =
        users.find((user) => {

            return (
                user.email.toLowerCase()
                === email.trim().toLowerCase()
            );

        });


    if (existingUser) {

        return res.status(409).json({

            success: false,

            message:
                "An account with this email already exists."

        });

    }


    const newUser = {

        id:
            Date.now().toString(),

        name:
            name.trim(),

        email:
            email.trim().toLowerCase(),

        passwordHash:
            hashPassword(password),

        area:
            area.trim()

    };


    users.push(newUser);

    saveUsers(users);


    res.status(201).json({

        success: true,

        message:
            "Account created successfully! 🎉",

        user: {

            id: newUser.id,

            name: newUser.name,

            email: newUser.email,

            area: newUser.area

        }

    });

});


// ==========================================
// LOGIN
// ==========================================

app.post("/api/auth/login", (req, res) => {

    const {
        email,
        password,
        area
    } = req.body;


    if (
        !email ||
        !password ||
        !area
    ) {

        return res.status(400).json({

            success: false,

            message:
                "Email, password and area are required."

        });

    }


    const users = getUsers();


    const user =
        users.find((item) => {

            return (
                item.email.toLowerCase()
                === email.trim().toLowerCase()
            );

        });


    if (!user) {

        return res.status(401).json({

            success: false,

            message:
                "Incorrect email or password."

        });

    }


    const passwordCorrect =
        verifyPassword(
            password,
            user.passwordHash
        );


    if (!passwordCorrect) {

        return res.status(401).json({

            success: false,

            message:
                "Incorrect email or password."

        });

    }


    user.area =
        area.trim();

    saveUsers(users);


    res.json({

        success: true,

        message:
            "Login successful! Welcome back 👋",

        user: {

            id: user.id,

            name: user.name,

            email: user.email,

            area: user.area

        }

    });

});


// ==========================================
// CREATE ORDER
// ==========================================

app.post("/api/orders", (req, res) => {

    const {
        customerName,
        email,
        phone,
        area,
        address,
        paymentMethod,
        items,
        subtotal,
        deliveryFee,
        total
    } = req.body;


    // Basic validation
    if (
        !customerName ||
        !email ||
        !phone ||
        !area ||
        !address ||
        !paymentMethod ||
        !Array.isArray(items) ||
        items.length === 0
    ) {

        return res.status(400).json({

            success: false,

            message:
                "Please provide complete order information."

        });

    }


    // Create order
    const orders =
        getOrders();


    const newOrder = {

        id:
            "BH-" +
            Date.now(),

        customerName:
            customerName.trim(),

        email:
            email.trim().toLowerCase(),

        phone:
            phone.trim(),

        area:
            area.trim(),

        address:
            address.trim(),

        paymentMethod:
            paymentMethod.trim(),

        items:
            items,

        subtotal:
            Number(subtotal) || 0,

        deliveryFee:
            Number(deliveryFee) || 0,

        total:
            Number(total) || 0,

        status:
            "Pending",

        createdAt:
            new Date().toISOString()

    };


    orders.push(newOrder);

    saveOrders(orders);


    res.status(201).json({

        success: true,

        message:
            "Order placed successfully! 🎉",

        order:
            newOrder

    });

});


// ==========================================
// GET ALL ORDERS
// ==========================================

app.get("/api/orders", (req, res) => {

    const orders =
        getOrders();


    res.json({

        success: true,

        count:
            orders.length,

        orders:
            orders

    });

});


// ==========================================
// UPDATE ORDER STATUS
// ==========================================

app.patch("/api/orders/:id/status", (req, res) => {

    const {
        status
    } = req.body;


    const allowedStatuses = [
        "Pending",
        "Preparing",
        "Out for Delivery",
        "Delivered",
        "Cancelled"
    ];


    if (!allowedStatuses.includes(status)) {

        return res.status(400).json({

            success: false,

            message:
                "Invalid order status."

        });

    }


    const orders =
        getOrders();


    const order =
        orders.find((item) => {

            return item.id === req.params.id;

        });


    if (!order) {

        return res.status(404).json({

            success: false,

            message:
                "Order not found."

        });

    }


    order.status =
        status;


    saveOrders(orders);


    res.json({

        success: true,

        message:
            "Order status updated successfully.",

        order:
            order

    });

});


// ==========================================
// START SERVER
// ==========================================

app.listen(PORT, () => {

    console.log(
        `BiteHub server running on http://localhost:${PORT}`
    );

});