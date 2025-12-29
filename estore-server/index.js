require("dotenv").config();


const express = require("express");
const productCategories = require("./routes/productCategories");
const products = require("./routes/products");
const users = require("./routes/users");
const orders = require("./routes/orders");
const checkout = require("./routes/checkout");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const PORT = 3000;

app.use(bodyParser.json());

app.use(cors());
app.use("/productCategories", productCategories);
app.use("/products", products);
app.use("/users", users)
app.use("/orders", orders);
app.use("/checkout", checkout);

const server = app.listen(PORT, () => {
    console.log("Server started on port 3000");
});