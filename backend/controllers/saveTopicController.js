import multer from "multer";
import { uploadToCloudinary } from "./fileController.js";
import { pool } from "../db.js";

// Комбінований middleware
export const uploadFiles = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // Ліміт для всіх файлів
  fileFilter: (req, file, cb) => {
    if (file.fieldname === "cover") {
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "video/mp4",
      ];
      return allowedTypes.includes(file.mimetype)
        ? cb(null, true)
        : cb(new Error("Непідтримуваний формат обкладинки"), false);
    }
    cb(null, true);
  },
}).fields([
  { name: "cover", maxCount: 1 },
  { name: "attachments", maxCount: 10 },
]);

export const saveTopic = async (req, res) => {
  const client = await pool.connect();
  try {
    // текстові поля
    const {
      title,
      author,
      description,
      rating = 0,
      status = "active",
    } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    // отримання файлів
    const cover = req.files?.["cover"] ? req.files["cover"][0] : null;
    const attachments = req.files?.["attachments"]
      ? req.files["attachments"]
      : [];

    const files = cover ? [cover, ...attachments] : attachments;
    let uploadedFiles = [];
    if (files.length)
      uploadedFiles = (await uploadToCloudinary(files))?.map(file => file.url);

    // отримання тегів з тіла запиту
    let rawTags = req.body.tags;

    let tagsList = [];
    if (typeof rawTags === "string") {
      try {
        tagsList = JSON.parse(rawTags);
        if (!Array.isArray(tagsList)) {
          tagsList = [rawTags]; // якщо це не JSON-масив, то це просто один тег у вигляді рядка
        }
      } catch (error) {
        tagsList = [rawTags]; // якщо не вдалося розпарсити, значить, це одиночний рядок
      }
    } else if (Array.isArray(rawTags)) {
      tagsList = rawTags;
    }

    // очищення тегів від зайвих пробілів та фільтрація порожніх
    const processedTags = tagsList
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    // збереження у БД
    await client.query("BEGIN");

    // Додаємо теги, якщо їх ще немає
    const tagInsertQuery = `
        INSERT INTO tags (tag_name)
        SELECT UNNEST($1::TEXT[]) ON CONFLICT (tag_name) DO NOTHING;
      `;

    await client.query(tagInsertQuery, [processedTags]);

    const topicInsertQuery = `
        INSERT INTO topics (title, author, description, rating, status, cover, attachments)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id;
      `;

    let coverUrl = cover && uploadedFiles.length ? uploadedFiles[0] : null;
    let attachmentsUrl = [];

    if (uploadedFiles.length && coverUrl) {
      attachmentsUrl = uploadedFiles.slice(1);
    } else if (uploadedFiles.length && !coverUrl) {
      attachmentsUrl = uploadedFiles;
    }

    const topicResult = await client.query(topicInsertQuery, [
      title,
      author,
      description || null,
      rating,
      status,
      coverUrl,
      attachmentsUrl,
    ]);
    const topicId = topicResult.rows[0].id;

    // Отримуємо ID тегів
    const getTagsIdQuery = `SELECT tag_id FROM tags WHERE tag_name = ANY($1::TEXT[]);`;
    const tagsResult = await client.query(getTagsIdQuery, [processedTags]);
    const tagIds = tagsResult.rows.map(row => row.tag_id);

    // Додаємо зв'язки тема-теги
    const topicTagsInsertQuery = `
        INSERT INTO topic_tags (topic_id, tag_id)
        VALUES ($1, UNNEST($2::INTEGER[]))
        ON CONFLICT DO NOTHING;
      `;
    await client.query(topicTagsInsertQuery, [topicId, tagIds]);

    await client.query("COMMIT");

    res.status(201).json({
      message: "Тема успішно створена",
      topic: { id: topicId, title, tags: processedTags },
    });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    res.status(500).json({ error: "Помилка сервера" });
  } finally {
    client.release();
  }
};
