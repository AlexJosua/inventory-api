import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

// koneksi
const koneksi = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "",
  database: process.env.DB_NAME || "inventory_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default koneksi;
