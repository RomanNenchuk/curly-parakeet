import pkg from "pg";
import dotenv from "dotenv";
dotenv.config({ path: "./config/.env" });
import { refreshPopuarTagsView } from "./controllers/tagController.js";
import { refreshTopicPopularityView } from "./controllers/topicController.js";
const { Pool } = pkg;

const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD } = process.env;

const pool = new Pool({
  host: PGHOST,
  database: PGDATABASE,
  user: PGUSER,
  password: PGPASSWORD,
  port: 5432,
  ssl: {
    rejectUnauthorized: false,
  },
  idleTimeoutMillis: 300000, // час очікування простою
  connectionTimeoutMillis: 20000, // час очікування з'єднання
});

const connectDB = async () => {
  try {
    const client = await pool.connect();
    console.log("Connected to database");
    client.release();
  } catch (error) {
    console.error("Error connecting to PostgreSQL:", error);
    throw error;
  }
};

pool.on("error", err => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

// Функція для виконання "keep-alive" запиту
const keepAliveQuery = async () => {
  try {
    const client = await pool.connect();
    await client.query("SELECT 1"); // Запит для підтримання з'єднання
    client.release(); // Звільняємо клієнт після запиту
    console.log("Keep-alive запит успішно виконано");
  } catch (err) {
    console.error("Помилка keep-alive запиту:", err.message);
  }
};

// виконую запит кожні 4 хвилини
setInterval(keepAliveQuery, 4 * 60 * 1000);

// кожні 15хв оновлюю представлення популярних тегів
setInterval(refreshPopuarTagsView, 15 * 60 * 1000);

// оновлюю представлення популярних тем
setInterval(refreshTopicPopularityView, 10 * 60 * 1000);

export { pool, connectDB };
