import { pool } from "../db.js";

export const checkUserRegistration = async (req, res) => {
  const id = req.params.id;

  try {
    const result = await pool.query(`SELECT * FROM users WHERE uid = $1`, [id]);

    if (result.rows.length > 0) {
      res.status(200).json({ message: "User found" });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const checkUsername = async (req, res) => {
  const username = req.params.username;

  try {
    const result = await pool.query(
      `SELECT email FROM users WHERE username = $1`,
      [username]
    );

    if (result.rows.length > 0) {
      res
        .status(200)
        .json({ message: "User found", email: result.rows[0].email });
    } else {
      res.status(200).json({ message: "User not found", email: null });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const checkUsernameOrEmail = async (req, res) => {
  const { username, email } = req.query;
  try {
    const result = await pool.query(
      `SELECT 
         COUNT(*) FILTER (WHERE username = $1) AS username_count,
         COUNT(*) FILTER (WHERE email = $2) AS email_count
       FROM users`,
      [username, email]
    );

    const usernameExists = parseInt(result.rows[0].username_count, 10) > 0;
    const emailExists = parseInt(result.rows[0].email_count, 10) > 0;

    res.status(200).json({
      usernameExists,
      emailExists,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
