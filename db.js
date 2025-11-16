import mysql from "mysql2";

// Read database config from environment with safe defaults.
// You can override these by setting DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT.
const {
  DB_HOST = "localhost",
  DB_USER = "root",
  DB_PASSWORD = "200606",
  DB_NAME = "restaurant_db",
  DB_PORT = "3306",
} = process.env;

const db = mysql.createConnection({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  port: Number(DB_PORT),
});

db.connect((err) => {
  if (err) {
    console.error("❌ Database connection failed:", err);
    return;
  }
  console.log(`✅ Connected to MySQL database "${DB_NAME}"`);
});

export default db;
