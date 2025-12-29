const mySql = require("mysql2");

const pool = mySql.createPool({
    host: "localhost",
    user: "root",
    password: "Udmglobal@123",
    database: "estore",
    port: 3306,
    multipleStatements: true // allow multiple sql query statement in an single call
});

module.exports = pool;