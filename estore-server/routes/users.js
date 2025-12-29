const express = require("express");
const pool = require("../shared/pool");
const bycrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const user = express.Router();

const EXPIRES_IN_SECONDS = 24 * 60 * 60;

user.post("/signup", async(req, res) => {
    const {email, password, firstName, lastName, address, city, state, pin} = req.body;
    try {
        const [existingUser] = await pool.promise().query("SELECT * FROM users WHERE email = ?", [email]);
        if(existingUser.length > 0) {
            return res.status(200).send({message :"Email already exists"});
        }

        const hashPassword = await bycrypt.hash(password, 10);
        await pool.promise().query("INSERT INTO users(email, password, firstName, lastName, address, city, state, pin) VALUES(?, ?, ?, ?, ?, ?, ?, ?)", [email, hashPassword, firstName, lastName, address, city, state, pin]);
        res.status(200).send({message :"Success"});
    } catch (error) {
        console.log("Signup Error:", error);
        res.status(500).send({
        error: error.code || "INTERNAL_SERVER_ERROR",
        message: error.message || "Something went wrong"
        });
    }
})

user.post("/login", async(req, res) => {
    const {email, password} = req.body;
    try {
        const [users] = await pool.promise().query("SELECT * FROM users WHERE email = ?", [email]);
        
        if(users.length === 0) {
            return res.status(200).send({message :"User does not exist."});
        }

        const user = users[0];
        const passwordMatch = await bycrypt.compare(password, user.password);
        if(!passwordMatch) {
            return res.status(401).send({message :"Incorrect password."});
        }
        const token = jwt.sign(
            {
                id: user.id ,email: user.email}, 
                process.env.SECRET_KEY, 
                {expiresIn: "1d"}
            );
        res.status(200).send({
            token: token, 
            expiresInSeconds: 3600, 
            user: {
                firstName: user.firstName,
                lastName: user.lastName,
                address: user.address,
                city: user.city,
                state: user.state,
                pin: user.pin
            },
            message:"Login successful"});
    } catch (error) {
        console.log("Login Error:", error);
        res.status(500).send({
        error: error.code || "INTERNAL_SERVER_ERROR",
        message: error.message || "Something went wrong"
        });
    }
})

module.exports = user;