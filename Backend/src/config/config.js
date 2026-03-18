const mysql = require("mysql2");
const dotenv = require("dotenv");

// Load environment variables from .env file
dotenv.config();

// Configuration object
const config = {
    server: {
        port: process.env.PORT || 4000,
    },
    db: {
        host: process.env.DB_HOST || "localhost",
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || "sabari@21",
        database: process.env.DB_NAME || "academic_learning",
        port: process.env.DB_PORT || 3306,
        connectionLimit: 10,
        waitForConnections: true,
        queueLimit: 0,
    },
};

// Create MySQL Connection Pool
const pool = mysql.createPool(config.db);

// Use promise-based queries
const db = pool.promise();

// Test DB Connection on Startup
const testDBConnection = async () => {
    try {
        const [rows] = await db.query("SELECT 1"); // Simple test query
        console.log("✅ Database Connected Successfully");
    } catch (err) {
        console.error("❌ Database Connection Failed:", err.message);
        setTimeout(testDBConnection, 5000); // Retry after 5 seconds
    }
};

// Run DB Connection Test
testDBConnection();

// Export database pool correctly
module.exports = { config, db };
