import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const pool = mysql.createPool({
  port: Number(process.env.DB_PORT),
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 3,
  queueLimit: 0,
});

async function connectDb() {
  try {
    const connection = await pool.getConnection();
    console.log("Database connection established!");
    connection.release();
  } catch (error) {
    console.error("Database connection failed:", error);
  }
}

connectDb();

export default pool;
