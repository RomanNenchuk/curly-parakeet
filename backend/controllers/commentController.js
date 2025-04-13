import { pool } from "../db.js";

export const getTopicComments = async (req, res) => {
  const id = req.params.id;
  const { user_id } = req.query;

  try {
    // Основний запит для коментарів
    const commentsResult = await pool.query(
      `
        SELECT
          c.id, 
          c.text,
          c.timestamp,
          c.author_id,
          c.topic_id,
          c.attachments,
          c.reply,
          u.fullname AS author_fullname,
          u.avatar,
          o.text AS reply_text,
          o.timestamp AS reply_timestamp
        FROM 
          comments c
        LEFT JOIN
          users u ON c.author_id = u.uid
        LEFT JOIN
          comments o ON c.reply = o.id
        WHERE 
          c.topic_id = $1
        ORDER BY 
          c.id ASC;
        `,
      [id]
    );

    const comments = commentsResult.rows;

    // Запит для всіх реакцій
    const reactionsResult = await pool.query(
      `
        SELECT 
          comment_id,
          emoji.name,
          emoji.icon,
          COUNT(*) AS count
        FROM comment_reactions
        INNER JOIN emoji ON comment_reactions.emoji_id = emoji.id
        GROUP BY comment_id, emoji.name, emoji.icon;
        `
    );

    const reactions = reactionsResult.rows;

    // Запит для реакцій конкретного користувача (якщо user_id передано)
    let userReactions = [];
    if (user_id) {
      const userReactionsResult = await pool.query(
        `
          SELECT 
            comment_id, 
            emoji.name AS name
          FROM comment_reactions
          LEFT JOIN emoji ON comment_reactions.emoji_id = emoji.id
          WHERE user_id = $1;
          `,
        [user_id]
      );
      userReactions = userReactionsResult.rows;
    }

    // Формування фінального результату
    const commentsWithReactions = comments.map(comment => {
      const commentReactions = reactions
        .filter(reaction => reaction.comment_id === comment.id)
        .map(reaction => ({
          icon: reaction.icon,
          name: reaction.name,
          count: parseInt(reaction.count, 10),
        }));

      const userReaction = userReactions.find(
        reaction => reaction.comment_id === comment.id
      );

      return {
        ...comment,
        reactions: commentReactions,
        user_reaction: userReaction || null,
      };
    });

    res.status(200).json(commentsWithReactions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
