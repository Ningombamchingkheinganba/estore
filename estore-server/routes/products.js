const express = require("express");
const pool = require("../shared/pool");
const products = express.Router();

products.get("/", (req, res) => {
    let { mainCategoryId, subCategoryId, keyword } = req.query;

    let query = "SELECT * FROM products";
    let queryParams = [];

    if (mainCategoryId) {
        query = `select products.* from products join categories on products.category_id = categories.id where categories.parent_category_id = ?`;
        queryParams.push(mainCategoryId);
        if (keyword) {
            query += ` AND keywords LIKE '%${keyword}%'`;
        }
    } else if (subCategoryId) {
        query += " WHERE category_id = ?";
        queryParams.push(subCategoryId);
    }

    pool.query(query, queryParams, (err, products) => {
        if (err) {
            return res.status(500).json(err);
        }
        res.status(200).json(products);
    });
});

products.get("/:id", (req, res) => {
    let id = req.params.id
    pool.query(`SELECT * FROM products WHERE id = ?`, [id], (err, product) => {
        if (err) {
            res.status(500).json(err);
        } else {
            res.status(200).json(product);
        }
    })
})

module.exports = products;