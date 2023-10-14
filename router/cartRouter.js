const express = require("express");
const {ProductModel}=require("../model/productmodel")
const { CartProductModel } = require("../model/cartModel"); // Replace with your actual cart model

const cartRouter = express.Router();

// Route to get cart items
cartRouter.get("/", async (req, res) => {
    try {
        const productId = req.query.productId;

        // Find the product with the specified ID
        const product = await ProductModel.findById(productId);

        if (!product) {
            return res.status(404).json({ message: 'Product not found.' });
        }

        // Return the complete product data
        res.status(200).json(product);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error", message: error.message });
    }
});

// Route to add item to cart
cartRouter.post("/add", async (req, res) => {
    const { productId, quantity } = req.body;
    try {
        // Check if the product is already in the cart
        let cartItem = await CartProductModel.findOne({ productId });
        if (cartItem) {
            // If the product is in the cart, update the quantity
            cartItem.quantity += quantity;
        } else {
            // If the product is not in the cart, create a new cart item
            cartItem = new CartProductModel({ productId, quantity });
        }

        // Save the cart item to the database
        await cartItem.save();

        res.status(201).json({ message: "Item added to cart", cartItem });
    } catch (error) {
        res.status(400).json({ error: "Bad Request", message: error.message });
    }
});

// Route to remove item from cart
cartRouter.delete("/remove/:id", async (req, res) => {
    const cartItemId = req.params.id;
    try {
        const cartItem = await CartProductModel.findByIdAndRemove(cartItemId);
        if (cartItem) {
            res.status(200).json({ message: "Item removed from cart", cartItem });
        } else {
            res.status(404).json({ error: "Not Found", message: "Cart item not found" });
        }
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error", message: error.message });
    }
});

module.exports = {
    cartRouter
};
