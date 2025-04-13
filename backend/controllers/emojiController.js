import { pool } from "../db.js"; // Підключення до бази даних

// Функція для отримання всіх реакцій теми
const getTopicReactions = async topicId => {
  const query = `
    SELECT e.name, e.icon, COUNT(r.emoji_id) AS count
    FROM topic_reactions r
    INNER JOIN emoji e ON r.emoji_id = e.id
    WHERE r.topic_id = $1
    GROUP BY e.name, e.icon
  `;
  const result = await pool.query(query, [topicId]);
  return result.rows;
};

export const setTopicReaction = async (req, res) => {
  const topicId = req.params.id;
  const { reaction } = req.body;
  const { uid } = req.user;

  try {
    // знаходжу emoji_id за ім'ям emoji
    const emojiQuery = `
      SELECT id FROM emoji
      WHERE name = $1
    `;
    const emojiResult = await pool.query(emojiQuery, [reaction]);

    if (emojiResult.rowCount === 0)
      return res.status(404).json({ message: "Emoji not found" });

    const emojiId = emojiResult.rows[0].id;

    // перевіряю, чи користувач ставив якусь реакцію під цією темою
    const existingReactionQuery = `
      SELECT id, emoji_id 
      FROM topic_reactions
      WHERE topic_id = $1 AND user_id = $2
    `;

    const existingReactionResult = await pool.query(existingReactionQuery, [
      topicId,
      uid,
    ]);

    // якщо ставив
    if (existingReactionResult.rowCount > 0) {
      const existingReaction = existingReactionResult.rows[0];

      // і якщо нова реакція збігається з існуючою, видаляємо її
      if (existingReaction.emoji_id === emojiId) {
        const deleteQuery = `
          DELETE FROM topic_reactions
          WHERE id = $1
          RETURNING *;
        `;
        await pool.query(deleteQuery, [existingReaction.id]);

        const updatedReactions = await getTopicReactions(topicId);
        return res.status(200).json({
          active: null,
          reactions: updatedReactions,
        });
      }

      // якщо нова реакція відрізняється, оновлюємо
      const updateQuery = `
        UPDATE topic_reactions
        SET emoji_id = $1, timestamp = CURRENT_TIMESTAMP
        WHERE id = $2
        RETURNING *;
      `;
      await pool.query(updateQuery, [emojiId, existingReaction.id]);

      const updatedReactions = await getTopicReactions(topicId);
      return res.status(200).json({
        active: reaction,
        reactions: updatedReactions,
      });
    }

    // якщо реакції ще немає, додаємо нову
    const insertQuery = `
      INSERT INTO topic_reactions (user_id, topic_id, emoji_id, timestamp)
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
      RETURNING *;
    `;
    await pool.query(insertQuery, [uid, topicId, emojiId]);

    const updatedReactions = await getTopicReactions(topicId);
    return res.status(201).json({
      active: reaction,
      reactions: updatedReactions,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Функція для отримання всіх реакцій коментаря
const getCommentReactions = async commentId => {
  const query = `
    SELECT e.name, e.icon, COUNT(r.emoji_id) AS count
    FROM comment_reactions r
    INNER JOIN emoji e ON r.emoji_id = e.id
    WHERE r.comment_id = $1
    GROUP BY e.name, e.icon
  `;
  const result = await pool.query(query, [commentId]);
  return result.rows;
};

export const setCommentReaction = async (req, res) => {
  const commentId = req.params.id;
  const { reaction } = req.body;
  const { uid } = req.user;

  try {
    // знаходжу emoji_id за ім'ям emoji
    const emojiQuery = `
        SELECT id FROM emoji
        WHERE name = $1
      `;
    const emojiResult = await pool.query(emojiQuery, [reaction]);

    if (emojiResult.rowCount === 0)
      return res.status(404).json({ message: "Emoji not found" });

    const emojiId = emojiResult.rows[0].id;

    // перевіряю, чи користувач ставив якусь реакцію під цією темою
    const existingReactionQuery = `
        SELECT id, emoji_id 
        FROM comment_reactions
        WHERE comment_id = $1 AND user_id = $2
      `;

    const existingReactionResult = await pool.query(existingReactionQuery, [
      commentId,
      uid,
    ]);

    // якщо ставив
    if (existingReactionResult.rowCount > 0) {
      const existingReaction = existingReactionResult.rows[0];

      // і якщо нова реакція збігається з існуючою, видаляємо її
      if (existingReaction.emoji_id === emojiId) {
        const deleteQuery = `
            DELETE FROM comment_reactions
            WHERE id = $1
            RETURNING *;
          `;
        await pool.query(deleteQuery, [existingReaction.id]);

        const updatedReactions = await getCommentReactions(commentId);
        return res.status(200).json({
          active: null,
          reactions: updatedReactions,
        });
      }

      // якщо нова реакція відрізняється, оновлюємо
      const updateQuery = `
          UPDATE comment_reactions
          SET emoji_id = $1, timestamp = CURRENT_TIMESTAMP
          WHERE id = $2
          RETURNING *;
        `;
      await pool.query(updateQuery, [emojiId, existingReaction.id]);

      const updatedReactions = await getCommentReactions(commentId);

      return res.status(200).json({
        active: reaction,
        reactions: updatedReactions,
      });
    }

    // якщо реакції ще немає, додаємо нову
    const insertQuery = `
        INSERT INTO comment_reactions (user_id, comment_id, emoji_id, timestamp)
        VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
        RETURNING *;
      `;
    await pool.query(insertQuery, [uid, commentId, emojiId]);

    const updatedReactions = await getCommentReactions(commentId);
    return res.status(201).json({
      active: reaction,
      reactions: updatedReactions,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
