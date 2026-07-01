const { Pool } = require("pg");

// La red interna de Railway no requiere SSL entre servicios del mismo proyecto.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

module.exports = pool;
