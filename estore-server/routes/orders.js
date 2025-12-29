const express = require("express");
const pool = require("../shared/pool");
const orders = express.Router();
const checktoken = require("../shared/checkToken");

orders.post("/add", checktoken, async(req, res) => {
    const {
        userName,
        userEmail,
        address,
        city,
        state,
        pin,
        total,
        orderDetails
    } = req.body

    try {
        const [users] = await pool.promise().query("SELECT * FROM users WHERE email = ?", [userEmail]);

        if(users.length === 0) {
            return res.status(200).send({message :"User does not exist."});
        }

        const userId = users[0].id;

        const [orderResult] = await pool.promise().query(
            "INSERT INTO orders(userId, userName, address, city, state, pin, total) VALUES(?, ?, ?, ?, ?, ?, ?)",
             [userId, userName, address, city, state, pin, total]);

        const orderId = orderResult.insertId; // it is only available for inserts into tables that have an auto_increment column

        const insertPromises = orderDetails.map((item) => {
            pool.promise().query(
                "INSERT INTO orderdetails(orderId, productId, qty, price, amount) VALUES(?, ?, ?, ?, ?)",
                [orderId, item.productId, item.qty, item.price, item.amount]
            )
        })
        await Promise.all(insertPromises);

        res.status(201).json({
            message: "Order placed successfully"
        });
    } catch (error) {
        console.log("Order placement error:", error);
        res.status(500).send({
            error: error.code || "INTERNAL_SERVER_ERROR",
            message: error.message || "Something went wrong"
        })
    }
})

orders.get("/allorders", checktoken, async(req,res) => {
    const {userEmail} = req.query;
    try {
        const [users] = await pool.promise().query("SELECT * FROM users WHERE email = ?", [userEmail]);
        if (users.length === 0) {
            return res.status(200).send({message :"User not found."});
        }

        const userId = users[0].id;

        const [orderData]  = await pool.promise().query(
            `select orderId, DATE_FORMAT(orderDate, '%d-%m-%Y') as orderDate, userName, address, city, state, pin, total from orders where userId = ?`,
            [userId]
        );

        const allorders = orderData.map((order) => {
            return {
                orderId: order.orderId,
                orderDate: order.orderDate,
                userName: order.userName,
                address: order.address,
                city: order.city,
                state: order.state,
                pin: order.pin,
                total: order.total
            }
        })

        res.status(200).json(allorders)

    } catch (error) {
        console.log("Error fetching orders: ", error);
        res.status(500).json({
            error: error.code || "INTERNAL_SERVER_ERROR",
            message: error.message || "Something went wrong"
        })
    }
})


orders.get("/orderproducts",checktoken, async(req, res) => {
    const {orderId} = req.query;
    try {
        const [orderProducts] = await pool.promise().query(
           `select od.productId, p.product_name, p.product_img, od.qty, od.price, od.amount from orderdetails od join products p on od.productId = p.id where od.orderId = ?`,[orderId]
        );

        const orderDetails = orderProducts.map((item) => {
            return{
                productId: item.productId,
                productName: item.product_name,
                productImage: item.product_img,
                qty: item.qty,
                price: item.price,
                amount: item.amount,
            }
        })
        res.status(200).json(orderDetails);
    } catch (error) {
        console.log("Error fetching order products:", error);
        res.status(500).json({
            error: error.code || "INTERNAL_SERVER_ERROR",
            message: error.message || "Something went wrong"
        })
    }
})

module.exports = orders;