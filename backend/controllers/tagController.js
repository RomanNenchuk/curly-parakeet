import { pool } from "../db.js";

export const getTagList = async (req, res) => {
  const { page = 1, limit = 25, search, all } = req.query;
  const offset = (page - 1) * limit;
  try {
    let query, params;

    if (!search || search.trim() === "") {
      query = "SELECT * FROM popular_tags LIMIT $1 OFFSET $2;";
      params = [limit, offset];
    } else {
      query = `
            SELECT * 
            FROM popular_tags 
            WHERE tag_name ILIKE $1
            LIMIT $2 OFFSET $3;
          `;
      params = [`%${search}%`, limit, offset];
    }
    const { rows } = await pool.query(query, params);
    return res.status(200).json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const refreshPopuarTagsView = async () => {
  try {
    await pool.query("REFRESH MATERIALIZED VIEW popular_tags");
    console.log("Materialized view 'popular_tags' refreshed");
  } catch (err) {
    console.error("Error refreshing materialized view:", err);
  }
};
