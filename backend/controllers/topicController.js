import { pool } from "../db.js";
import { deleteAttachments } from "../controllers/fileController.js";

// для відображення на головній сторінці
export const getTopicsPreview = async (req, res) => {
  const { page = 1, limit = 10, sort, user_id, tags, authors } = req.query;
  const offset = (page - 1) * limit;

  const sortCriteria = {
    asc: "topics.date ASC",
    desc: "topics.date DESC",
    rating: "rating DESC",
  };

  let orderBy = sortCriteria[sort] || "topics.date DESC";
  let subsFilterQuery = "";
  let queryParams = [limit, offset];

  if (sort === "subs" && user_id) {
    subsFilterQuery = `
      AND topics.author IN (
        SELECT subscription_id FROM user_subscriptions WHERE user_id = $3
      )
    `;
    queryParams.push(user_id);
  }

  let tagsFilterQuery = "";
  const tagList =
    tags
      ?.split(",")
      .map(tag => tag.trim())
      .filter(Boolean) || [];
  if (tagList.length > 0) {
    const placeholders = tagList
      .map((_, index) => `$${queryParams.length + index + 1}`)
      .join(", ");
    tagsFilterQuery = `
      AND topics.id IN (
        SELECT topic_id FROM topic_tags
        INNER JOIN tags ON tags.tag_id = topic_tags.tag_id
        WHERE tags.tag_name IN (${placeholders})
        GROUP BY topic_id HAVING COUNT(DISTINCT tags.tag_name) = ${tagList.length}
      )
    `;
    queryParams.push(...tagList);
  }

  let authorsFilterQuery = "";
  const authorList =
    authors
      ?.split(",")
      .map(author => author.trim())
      .filter(Boolean) || [];
  if (authorList.length > 0) {
    const placeholders = authorList
      .map((_, index) => `$${queryParams.length + index + 1}`)
      .join(", ");
    authorsFilterQuery = `AND users.username IN (${placeholders})`;
    queryParams.push(...authorList);
  }

  try {
    const topicsResult = await pool.query(
      `
      WITH tags_cte AS (
          SELECT topic_tags.topic_id, ARRAY_AGG(DISTINCT tags.tag_name) AS tag_list
          FROM topic_tags
          LEFT JOIN tags ON topic_tags.tag_id = tags.tag_id
          GROUP BY topic_tags.topic_id
      ),
      rating_cte AS (
          SELECT topic_reactions.topic_id, COALESCE(SUM(emoji.score), 0) AS rating
          FROM topic_reactions
          LEFT JOIN emoji ON emoji.id = topic_reactions.emoji_id
          GROUP BY topic_reactions.topic_id
      )
      SELECT topics.id, users.fullname AS author_full_name, users.username, 
             users.avatar AS author_avatar, topics.title, users.email, topics.author, 
             COALESCE(rating_cte.rating, 0) AS rating, topics.cover, topics.date,
             COALESCE(tags_cte.tag_list, '{}') AS tag_list
      FROM topics
      INNER JOIN users ON users.uid = topics.author
      LEFT JOIN tags_cte ON topics.id = tags_cte.topic_id
      LEFT JOIN rating_cte ON topics.id = rating_cte.topic_id
      WHERE 1=1
      ${subsFilterQuery}
      ${tagsFilterQuery}
      ${authorsFilterQuery}
      ORDER BY ${orderBy}
      LIMIT $1 OFFSET $2;
      `,
      queryParams
    );

    const topics = topicsResult.rows;

    const reactionsResult = await pool.query(
      `SELECT topic_id, emoji.name, emoji.icon, COUNT(*) AS count
       FROM topic_reactions
       INNER JOIN emoji ON topic_reactions.emoji_id = emoji.id
       GROUP BY topic_id, emoji.name, emoji.icon;`
    );

    const reactions = reactionsResult.rows;

    let userReactions = [];
    if (user_id) {
      const userReactionsResult = await pool.query(
        `SELECT topic_id, emoji.name AS name
         FROM topic_reactions
         LEFT JOIN emoji ON topic_reactions.emoji_id = emoji.id
         WHERE user_id = $1;`,
        [user_id]
      );
      userReactions = userReactionsResult.rows;
    }

    let userSubscriptions = [];
    if (user_id) {
      const resSubs = await pool.query(
        `SELECT subscription_id FROM user_subscriptions WHERE user_id = $1`,
        [user_id]
      );
      userSubscriptions = resSubs.rows.map(row => row.subscription_id);
    }

    const topicsWithReactions = topics.map(topic => {
      const topicReactions = reactions
        .filter(reaction => reaction.topic_id === topic.id)
        .map(reaction => ({
          icon: reaction.icon,
          name: reaction.name,
          count: parseInt(reaction.count, 10),
        }));

      const userReaction = userReactions.find(
        reaction => reaction.topic_id === topic.id
      );

      topic.subscribed = userSubscriptions.includes(topic.author)
        ? true
        : topic.author === user_id
        ? "none"
        : false;

      return {
        ...topic,
        reactions: topicReactions,
        user_reaction: userReaction || null,
      };
    });

    res.status(200).json(topicsWithReactions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getUserTopic = async (req, res) => {
  const { user_id, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;
  try {
    const topicsResult = await pool.query(
      `
      SELECT 
      topics.id, 
      fullname AS author_full_name, 
      username, 
      avatar AS author_avatar, 
      title, 
      email, 
      author, 
      COALESCE(SUM(emoji.score), 0) AS rating,
      cover,
      topics.date,
      COALESCE(ARRAY_AGG(DISTINCT tags.tag_name) FILTER (WHERE tags.tag_name IS NOT NULL), '{}') AS tag_list
      FROM topics
      INNER JOIN users ON users.uid = topics.author
      left join topic_tags on topics.id = topic_tags.topic_id
      left join tags on topic_tags.tag_id = tags.tag_id
      LEFT JOIN topic_reactions
        ON topics.id = topic_reactions.topic_id
      LEFT JOIN emoji
        ON emoji.id = topic_reactions.emoji_id
      WHERE users.uid = $1
      GROUP BY topics.id, fullname, username, avatar, title, email, author, topics.date
      ORDER BY topics.date DESC
      LIMIT $2 OFFSET $3;
      `,
      [user_id, limit, offset]
    );
    const topics = topicsResult.rows;
    const reactionsResult = await pool.query(
      `
      SELECT 
        topic_id,
        emoji.name,
        emoji.icon,
        COUNT(*) AS count
      FROM topic_reactions
      INNER JOIN emoji ON topic_reactions.emoji_id = emoji.id
      
      GROUP BY topic_id, emoji.name, emoji.icon;
      `
    );
    const reactions = reactionsResult.rows;

    let userReactions = [];
    const userReactionsResult = await pool.query(
      `
        SELECT 
          topic_id, 
          emoji.name AS name
        FROM topic_reactions
        LEFT JOIN emoji ON topic_reactions.emoji_id = emoji.id
        WHERE user_id = $1;
        `,
      [user_id]
    );
    userReactions = userReactionsResult.rows;

    const topicsWithReactions = topics.map(topic => {
      const topicReactions = reactions
        .filter(reaction => reaction.topic_id === topic.id)
        .map(reaction => ({
          icon: reaction.icon,
          name: reaction.name,
          count: parseInt(reaction.count, 10),
        }));

      const userReaction = userReactions.find(
        reaction => reaction.topic_id === topic.id
      );

      return {
        ...topic,
        reactions: topicReactions,
        user_reaction: userReaction || null,
      };
    });

    res.status(200).json(topicsWithReactions);
  } catch (error) {
    res.status(500).json("Internal server error");
    console.error(error);
  }
};

export const getTopic = async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id } = req.query;

    // 1. базова інформація про тему
    const topicResult = await pool.query(
      `
      SELECT 
        topics.id,
        uid, 
        fullname AS authorFullName, 
        username, 
        avatar, 
        title, 
        author, 
        description, 
        attachments,
        cover,
        TO_CHAR(topics.date, 'DD.MM.YYYY') AS formatted_date
      FROM topics 
      left join topic_tags on topics.id = topic_tags.topic_id
      left join tags on topic_tags.tag_id = tags.tag_id
      INNER JOIN users 
        ON topics.author = users.uid  
      WHERE topics.id = $1
      
      `,
      [id]
    );

    if (topicResult.rows.length === 0) {
      return res.status(404).json({ message: "Topic not found" });
    }

    const topic = topicResult.rows[0];

    // 2. всі реакції до теми
    const reactionsResult = await pool.query(
      `
      SELECT 
        emoji.name AS name, 
        emoji.icon AS icon, 
        COUNT(*) AS count
      FROM topic_reactions
      INNER JOIN emoji ON topic_reactions.emoji_id = emoji.id
      WHERE topic_reactions.topic_id = $1
      GROUP BY emoji.name, emoji.icon
      `,
      [id]
    );

    const reactions = reactionsResult.rows.map(reaction => ({
      name: reaction.name,
      icon: reaction.icon,
      count: parseInt(reaction.count, 10),
    }));

    // 3. реакція конкретного користувача (якщо user_id передано)
    let userReaction = null;
    if (user_id) {
      const userReactionResult = await pool.query(
        `
        SELECT 
          emoji.name AS name, 
          emoji.icon AS icon
        FROM topic_reactions
        INNER JOIN emoji ON topic_reactions.emoji_id = emoji.id
        WHERE topic_reactions.topic_id = $1 AND topic_reactions.user_id = $2
        LIMIT 1
        `,
        [id, user_id]
      );

      if (userReactionResult.rows.length > 0) {
        userReaction = userReactionResult.rows[0];
      }
    }

    //4. отримання інфи про підписки юзера на автора
    let userSubscriptions = [];

    if (user_id) {
      const resSubs = await pool.query(
        `SELECT subscription_id FROM user_subscriptions WHERE user_id = $1`,
        [user_id]
      );
      userSubscriptions = resSubs.rows;
    }

    //5. отримання спииску прикріплених до теми тегів
    let tags_list = [];

    const resTags = await pool.query(
      `SELECT 
       COALESCE(ARRAY_AGG(DISTINCT tags.tag_name) FILTER (WHERE tags.tag_name IS NOT NULL), '{}') AS tag_list
       FROM topics
       LEFT JOIN topic_tags ON topics.id = topic_tags.topic_id
       LEFT JOIN tags ON topic_tags.tag_id = tags.tag_id
       WHERE topics.id = $1
      `,
      [id]
    );

    tags_list = resTags.rows[0].tag_list;

    // 6. результати
    res.status(200).json({
      ...topic,
      reactions,
      user_reaction: userReaction,
      tag_list: tags_list,
      subscribed: userSubscriptions.find(
        subs => subs.subscription_id == topic.author
      )
        ? (topic.subscribed = true)
        : topic.author == user_id
        ? (topic.subscribed = "none")
        : (topic.subscribed = false),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const postNewComment = async (req, res) => {
  const comm = req.body;
  try {
    const query = `
      INSERT INTO comments (
        text, timestamp, author_id, topic_id, attachments, reply
      ) VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
    const reply_text_query = `
      SELECT text FROM comments WHERE id = $1
    `;
    const result = await pool.query(query, [
      comm.text,
      comm.timestamp,
      comm.author_id,
      comm.topic_id,
      comm.attachments,
      comm.reply,
    ]);
    let reply_text = "";
    if (comm.reply !== -1) {
      reply_text = (await pool.query(reply_text_query, [comm.reply])).rows[0]
        .text;
    }
    res.status(201).json({
      id: result.rows[0].id,
      reply_text: reply_text,
    });
  } catch (error) {
    console.error("PostNewComment error:", error);
    res.status(500);
  }
};

export const deleteComment = async (req, res) => {
  const id = req.params.id;
  try {
    const query = `DELETE FROM comments WHERE id = $1 RETURNING attachments`;
    const response = await pool.query(query, [id]);
    if (response.rows.length) deleteAttachments(response.rows[0].attachments);
    res.status(200).json({
      done: true,
    });
  } catch (error) {
    console.error(error);
    res.status(500);
  }
};

export const editComments = async (req, res) => {
  const { text, attachments, id } = req.body;
  try {
    const query = `
      UPDATE comments 
      SET text = $1, attachments = $2
      WHERE id = $3
      RETURNING *;
    `;
    const result = await pool.query(query, [text, attachments, id]);
    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error with editComments: ", error);
    res.status(500);
  }
};

export const deleteTopic = async (req, res) => {
  const client = await pool.connect();
  const id = req.params.id;

  try {
    await client.query("BEGIN");

    const DELETE_COMMENTS_QUERY = `
      DELETE FROM comments WHERE topic_id = $1 RETURNING attachments
    `;
    const commentsResponse = await client.query(DELETE_COMMENTS_QUERY, [id]);

    const DELETE_TOPIC_QUERY = `
      DELETE FROM topics WHERE id = $1 RETURNING attachments, cover
    `;
    const topicResponse = await client.query(DELETE_TOPIC_QUERY, [id]);

    let filesToDelete = [];

    // вкладення від коментарів
    commentsResponse.rows.forEach(({ attachments }) => {
      if (attachments) filesToDelete.push(...attachments);
    });

    // вкладення від теми
    if (topicResponse.rows.length) {
      const { attachments, cover } = topicResponse.rows[0];
      if (attachments) filesToDelete.push(...attachments);
      if (cover) filesToDelete.push(cover);
    }

    if (filesToDelete.length)
      deleteAttachments(filesToDelete).catch(error =>
        console.error("Error deleting attachments:", error)
      );

    await client.query("COMMIT");
    res.status(200).json({ done: true });
  } catch (error) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: "Internal server error" });
    console.error("Error with deleteTopic:", error);
  } finally {
    client.release();
  }
};

export const switchTopicToUser = async (req, res) => {
  const { user_id, topic_id } = req.body;
  try {
    const CHECK_QUERY = `
      SELECT * FROM saved_topics WHERE user_id = $1 AND topic_id = $2;
    `;
    const SAVE_QUERY = `
      INSERT INTO saved_topics (user_id, topic_id) VALUES ($1, $2);
    `;
    const DELETE_QUERY = `
      DELETE FROM saved_topics WHERE user_id = $1 AND topic_id = $2;
    `;
    const exist = await pool.query(CHECK_QUERY, [user_id, topic_id]);
    if (!exist.rows.length) {
      await pool.query(SAVE_QUERY, [user_id, topic_id]);
      res.status(201).json({ status: "saved" });
    } else {
      await pool.query(DELETE_QUERY, [user_id, topic_id]);
      res.status(200).json({ status: "deleted" });
    }
  } catch (error) {
    console.error("Error in saveTopicToUser: ", error);
    res.status(500).json({ status: "failed" });
  }
};

export const getIsTopicSaved = async (req, res) => {
  try {
    const { user_id, topic_id } = req.query;
    const QUERY = `
    SELECT * FROM saved_topics WHERE user_id = $1 AND topic_id = $2;
    `;
    const result = await pool.query(QUERY, [user_id, topic_id]);
    if (result.rows.length) {
      res.status(200).json({ saved: true });
    } else {
      res.status(200).json({ saved: false });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ saved: false });
  }
};

export const getSavedTopics = async (req, res) => {
  const { user_id, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  try {
    const topicsResult = await pool.query(
      `
        SELECT 
        topics.id, 
        fullname AS author_full_name, 
        username, 
        avatar AS author_avatar, 
        title, 
        email, 
        author, 
        COALESCE(SUM(emoji.score), 0) AS rating,
        topics.date,
        cover,
        COALESCE(ARRAY_AGG(DISTINCT tags.tag_name) FILTER (WHERE tags.tag_name IS NOT NULL), '{}') AS tag_list,
        saved_topics.timestamp
      FROM topics
      INNER JOIN users ON users.uid = topics.author
      INNER JOIN saved_topics ON topics.id = saved_topics.topic_id
      LEFT JOIN topic_tags on topics.id = topic_tags.topic_id
      LEFT JOIN tags on topic_tags.tag_id = tags.tag_id
      LEFT JOIN topic_reactions ON topics.id = topic_reactions.topic_id
      LEFT JOIN emoji ON emoji.id = topic_reactions.emoji_id
      WHERE saved_topics.user_id = $1
      GROUP BY topics.id, fullname, username, avatar, title, email, author, topics.date, saved_topics.timestamp
      ORDER BY saved_topics.timestamp DESC
      LIMIT $2 OFFSET $3;
      `,
      [user_id, limit, offset]
    );
    const topics = topicsResult.rows;
    const reactionsResult = await pool.query(
      `
      SELECT 
        topic_id,
        emoji.name,
        emoji.icon,
        COUNT(*) AS count
      FROM topic_reactions
      INNER JOIN emoji ON topic_reactions.emoji_id = emoji.id
      GROUP BY topic_id, emoji.name, emoji.icon;
      `
    );
    const reactions = reactionsResult.rows;

    let userReactions = [];
    const userReactionsResult = await pool.query(
      `
        SELECT 
          topic_id, 
          emoji.name AS name
        FROM topic_reactions
        LEFT JOIN emoji ON topic_reactions.emoji_id = emoji.id
        WHERE user_id = $1;
        `,
      [user_id]
    );
    userReactions = userReactionsResult.rows;

    let userSubscriptions = [];
    if (user_id) {
      const resSubs = await pool.query(
        `SELECT subscription_id FROM user_subscriptions WHERE user_id = $1`,
        [user_id]
      );
      userSubscriptions = resSubs.rows; // Оновлюємо змінну тут
    }

    // Формування фінального результату
    const topicsWithReactions = topics.map(topic => {
      const topicReactions = reactions
        .filter(reaction => reaction.topic_id === topic.id)
        .map(reaction => ({
          icon: reaction.icon,
          name: reaction.name,
          count: parseInt(reaction.count, 10),
        }));

      const userReaction = userReactions.find(
        reaction => reaction.topic_id === topic.id
      );

      if (userSubscriptions.find(subs => subs.subscription_id == topic.author))
        topic.subscribed = true;
      else {
        if (topic.author == user_id) topic.subscribed = "none";
        else topic.subscribed = false;
      }

      return {
        ...topic,
        reactions: topicReactions,
        user_reaction: userReaction || null,
      };
    });

    res.status(200).json(topicsWithReactions);
  } catch (error) {
    res.status(500).json("Internal server error");
    console.error(error);
  }
};

export const refreshTopicPopularityView = async () => {
  try {
    await pool.query("REFRESH MATERIALIZED VIEW topic_popularity");
    console.log("Materialized view 'topic_popularity' refreshed");
  } catch (err) {
    console.error("Error refreshing materialized view:", err);
  }
};

export const getPopularTopics = async (req, res) => {
  const { user_id, period = "month", page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;
  try {
    const topicsResult = await pool.query(
      `
      SELECT 
      topics.id, 
      fullname AS author_full_name, 
      username, 
      avatar AS author_avatar, 
      title, 
      email, 
      author, 
      COALESCE(SUM(emoji.score), 0) AS rating,
      cover,
      topics.date,
      topic_popularity.${period}_rating,
      COALESCE(ARRAY_AGG(DISTINCT tags.tag_name) FILTER (WHERE tags.tag_name IS NOT NULL), '{}') AS tag_list
      FROM topics
      INNER JOIN topic_popularity ON topic_popularity.id = topics.id
      INNER JOIN users ON users.uid = topics.author
      left join topic_tags on topics.id = topic_tags.topic_id
      left join tags on topic_tags.tag_id = tags.tag_id
      LEFT JOIN topic_reactions
        ON topics.id = topic_reactions.topic_id
      LEFT JOIN emoji
        ON emoji.id = topic_reactions.emoji_id
      GROUP BY topics.id, fullname, username, avatar, title, email, author, topics.date, topic_popularity.${period}_rating
      ORDER BY ${period}_rating DESC, topics.date DESC
      LIMIT $1 OFFSET $2;
      `,
      [limit, offset]
    );
    const topics = topicsResult.rows;
    const reactionsResult = await pool.query(
      `
      SELECT 
        topic_id,
        emoji.name,
        emoji.icon,
        COUNT(*) AS count
      FROM topic_reactions
      INNER JOIN emoji ON topic_reactions.emoji_id = emoji.id
      
      GROUP BY topic_id, emoji.name, emoji.icon;
      `
    );
    const reactions = reactionsResult.rows;

    let userReactions = [];
    if (user_id) {
      const userReactionsResult = await pool.query(
        `SELECT topic_id, emoji.name AS name
         FROM topic_reactions
         LEFT JOIN emoji ON topic_reactions.emoji_id = emoji.id
         WHERE user_id = $1;`,
        [user_id]
      );
      userReactions = userReactionsResult.rows;
    }

    let userSubscriptions = [];
    if (user_id) {
      const resSubs = await pool.query(
        `SELECT subscription_id FROM user_subscriptions WHERE user_id = $1`,
        [user_id]
      );
      userSubscriptions = resSubs.rows.map(row => row.subscription_id);
    }

    const topicsWithReactions = topics.map(topic => {
      const topicReactions = reactions
        .filter(reaction => reaction.topic_id === topic.id)
        .map(reaction => ({
          icon: reaction.icon,
          name: reaction.name,
          count: parseInt(reaction.count, 10),
        }));

      const userReaction = userReactions.find(
        reaction => reaction.topic_id === topic.id
      );

      topic.subscribed = userSubscriptions.includes(topic.author)
        ? true
        : topic.author === user_id
        ? "none"
        : false;

      return {
        ...topic,
        reactions: topicReactions,
        user_reaction: userReaction || null,
      };
    });

    res.status(200).json(topicsWithReactions);
  } catch (error) {
    res.status(500).json("Internal server error");
    console.error(error);
  }
};
