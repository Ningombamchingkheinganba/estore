const express = require("express");
const pool = require("../shared/pool");
const productCategories = express.Router();

productCategories.get("/", (req, res) => {
    pool.query("SELECT * FROM categories", (err, rows) => {
        if (err) {
            res.status(500).json(err);
        } else {
            res.status(200).json(rows);
        }
    })
})

module.exports = productCategories;;