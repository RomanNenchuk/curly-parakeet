import { pool } from "../db.js";
import { deleteAttachments } from "./fileController.js";

export const getChatList = async (req, res) => {
  const { uid } = req.user;

  const query = `
  SELECT 
  chats.id AS chat_id, 
  CASE 
    WHEN chats.user1_id = $1 THEN chats.user2_id
    ELSE chats.user1_id
  END AS other_user_id,
  CASE 
    WHEN chats.user1_id = $1 THEN u2.fullname
    ELSE u1.fullname
  END AS other_user_name,
  CASE 
    WHEN chats.user1_id = $1 THEN u2.avatar
    ELSE u1.avatar
  END AS other_user_avatar,
  last_message.sender_id AS last_message_sender_id,
  last_message.timestamp AS last_message_timestamp,
  COALESCE(unread_count.unread_messages, 0) AS unread_messages_count
  FROM chats
    INNER JOIN users u1 ON chats.user1_id = u1.uid
    INNER JOIN users u2 ON chats.user2_id = u2.uid
    LEFT JOIN LATERAL (
      SELECT 
        sender_id, 
        timestamp
      FROM messages
      WHERE messages.chat_id = chats.id
      ORDER BY timestamp DESC
      LIMIT 1
    ) last_message ON true
    LEFT JOIN (
      SELECT 
        chat_id, 
        COUNT(*) AS unread_messages
      FROM messages
      WHERE read = false AND sender_id != $1
      GROUP BY chat_id
    ) unread_count ON chats.id = unread_count.chat_id
    WHERE chats.user1_id = $1 OR chats.user2_id = $1
    ORDER BY COALESCE(last_message.timestamp, '1970-01-01') DESC;
  `;

  try {
    const result = await pool.query(query, [uid]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No chats found" });
    }

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const fetchOrCreateChat = async (req, res) => {
  const chat_id = req.params.id;
  const { sender_id, receiver_id } = req.body;

  const client = await pool.connect();

  try {
    // починаю транзакцію
    await client.query("BEGIN");

    const chatInsertQuery = `
      INSERT INTO chats (id, user1_id, user2_id, timestamp)
      VALUES ($1, $2, $3, NOW())
      ON CONFLICT (id) DO NOTHING;
    `;
    const result = await client.query(chatInsertQuery, [
      chat_id,
      sender_id,
      receiver_id,
    ]);

    const updateMessagesQuery = `
    UPDATE messages
    SET read = true
    WHERE chat_id = $1 AND read = false AND sender_id != $2;
    `;
    await client.query(updateMessagesQuery, [chat_id, sender_id]);

    const messagesQuery = `
    SELECT 
      m.id, 
      u.fullname, 
      m.sender_id, 
      m.text, 
      m.attachments, 
      m.timestamp, 
      m.reply,
      r.text AS reply_text,
      COALESCE(
          (CASE 
              WHEN r.attachments IS NOT NULL AND array_length(r.attachments, 1) > 0 
              THEN r.attachments[1] 
              ELSE NULL 
          END),
          NULL
      ) AS reply_attachment,
      ru.fullname AS reply_fullname
    FROM 
        messages m
    INNER JOIN 
        users u ON m.sender_id = u.uid
    LEFT JOIN 
        messages r ON m.reply = r.id
    LEFT JOIN 
        users ru ON r.sender_id = ru.uid
    WHERE 
        m.chat_id = $1
    ORDER BY 
        m.timestamp ASC;
  `;

    const messages = await client.query(messagesQuery, [chat_id]);

    // завершую транзакцію
    await client.query("COMMIT");

    res.status(200).json({
      chat_id,
      messages: messages.rows,
      isNewChat: result.rowCount > 0,
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error handling chat:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    client.release();
  }
};

export const saveMessage = async ({
  sender_id,
  chat_id,
  text,
  attachments,
  timestamp,
  read,
  reply,
}) => {
  const query = `
    INSERT INTO messages (chat_id, sender_id, text, attachments, timestamp, read, reply)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *;
  `;

  try {
    const result = await pool.query(query, [
      chat_id, // $1
      sender_id, // $2
      text, // $3
      attachments, // $4
      timestamp, // $5
      read, // $6
      reply, // &7
    ]);
    return {
      id: result.rows[0].id,
    };
  } catch (error) {
    console.log(error);
  }
};

export const deleteMessage = async id => {
  const query = `DELETE FROM messages WHERE id = $1 RETURNING attachments`;
  try {
    const response = await pool.query(query, [id]);

    if (response.rows.length > 0) return response.rows[0].attachments;
    else return [];
  } catch (error) {
    console.error(error);
    throw new Error("Failed to delete message");
  }
};

export const editMessage = async msg => {
  const query = `
    UPDATE messages 
    SET text = $1, attachments = $2
    WHERE id = $3
    RETURNING *;
    `;
  try {
    const result = await pool.query(query, [msg.text, msg.attachments, msg.id]);
  } catch (error) {
    console.error(error);
  }
};

const deleteMessagesByChatId = async chatId => {
  const deleteChatMessagesQuery =
    "DELETE FROM messages WHERE chat_id = $1 RETURNING attachments";
  try {
    const response = await pool.query(deleteChatMessagesQuery, [chatId]);
    // всі файли для видалення
    let filesToDelete = [];
    response.rows.forEach(({ attachments }) => {
      if (attachments) filesToDelete.push(...attachments);
    });

    if (filesToDelete.length)
      deleteAttachments(filesToDelete).catch(error => console.error(error));
  } catch (error) {
    console.error("Error deleting messages:", error);
    throw error;
  }
};

export const deleteChat = async (req, res) => {
  const id = req.params.id;
  try {
    const deleteChatQuery = "DELETE FROM chats WHERE id = $1";
    // видалення всіх повідомлень
    await deleteMessagesByChatId(id);
    // видалення самого чату
    await pool.query(deleteChatQuery, [id]);
    res.status(200).json({ message: "Chat deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
    console.error("Error deleting chat: ", error);
  }
};

export const clearChat = async (req, res) => {
  const id = req.params.id;
  try {
    await deleteMessagesByChatId(id);
    res.status(200).json({ message: "Chat messages cleared successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
    console.error("Error clearing chat: ", error);
  }
};
