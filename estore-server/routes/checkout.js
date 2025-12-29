const express = require("express");
const checkout = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);


const bodyParsor = require("body-parser");

checkout.use(bodyParsor.json());

checkout.post("/create-checkout-session", async(req, res) => {
    const {cartItems} = req.body;
    try {
        const lineItems = cartItems.map(item => {
            return {
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: item.name
                    },
                    unit_amount: item.price * 100
                },
                quantity: item.quantity
            }
        });

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: lineItems,
            mode: "payment",
            success_url: "http://localhost:4200/home/cart?status=success",
            cancel_url: "http://localhost:4200/home/cart?status=cancel"
        });

        res.json({url: session.url});
    } catch (error) {
        res.status(500).json({error: error.message});
    }
})

module.exports = checkout;
