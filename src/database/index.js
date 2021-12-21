const database = require("mongoose");

database.connect(process.env.DATABASE_URI);

module.exports = database;