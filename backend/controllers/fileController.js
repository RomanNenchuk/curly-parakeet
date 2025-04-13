import multer from "multer";
import { pool } from "../db.js";
import cloudinary from "../utils/cloudinary.js";

const imageFormats = [
  "jpg",
  "jpeg",
  "png",
  "gif",
  "webp",
  "bmp",
  "tiff",
  "svg",
];

// Налаштування multer для аватарів
const uploadImage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // Максимум 5 МБ
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    allowedTypes.includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error("Непідтримуваний формат файлу"), false);
  },
});

export const saveImage = (req, res) => {
  uploadImage.single("profileImage")(req, res, async err => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    try {
      const uid = req.params.id;

      // Завантаження на Cloudinary напряму з буфера
      const result = await cloudinary.uploader.upload(
        `data:${req.file.mimetype};base64,${req.file.buffer.toString(
          "base64"
        )}`,
        {
          folder: "profileImages",
          public_id: uid,
        }
      );

      // Оновлення URL зображення в базі даних
      const query = `
        UPDATE users
        SET avatar = $1
        WHERE uid = $2
        RETURNING *`;
      const updatedUser = await pool.query(query, [result.secure_url, uid]);

      return res.status(200).json({
        message: "Image is successfully uploaded!",
        fileUrl: result.secure_url,
        user: updatedUser.rows[0],
      });
    } catch (error) {
      console.error("Error:", error);
      return res.status(500).json({ error: "Error uploading image" });
    }
  });
};

export const deleteAvatar = async (req, res) => {
  try {
    const uid = req.params.id;
    const updateQuery = `
      UPDATE users
      SET avatar = NULL
      WHERE uid = $1
      RETURNING avatar`;
    const result = await pool.query(updateQuery, [uid]);

    // якщо користувача немає
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    await cloudinary.uploader.destroy(`profileImages/${uid}`);

    return res.status(200).json({ message: "Image successfully deleted!" });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Error deleting image" });
  }
};

// налаштування multer для вкладень
const uploadAttachment = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // Максимум 50 МБ
});

export const uploadToCloudinary = async files => {
  try {
    const results = [];
    for (let file of files) {
      const fileExtension = file.originalname.split(".").pop();
      const mimeType = file.mimetype;

      const resourceType = mimeType.startsWith("image/") ? "image" : "raw";

      const result = await cloudinary.uploader.upload(
        `data:${mimeType};base64,${file.buffer.toString("base64")}`,
        {
          resource_type: resourceType,
          folder: "attachments",
          public_id: `${Date.now()}_${file.originalname.split(".")[0]}`,
          format: fileExtension,
        }
      );

      results.push({
        originalName: file.originalname,
        url: result.secure_url,
        public_id: result.public_id,
        format: result.format,
      });
    }
    return results;
  } catch (error) {
    console.log("AAAAAAAAAAA");
    console.error("Failed to upload", error);
    console.log("AAAAAAAAAAA");
    throw error;
  }
};

export const saveAttachments = (req, res) => {
  uploadAttachment.array("files", 10)(req, res, async err => {
    if (err) return res.status(400).json({ error: err.message });

    if (!req.files || req.files.length === 0)
      return res.status(400).json({ error: "No files uploaded" });

    try {
      const results = await uploadToCloudinary(req.files);
      return res.status(200).json({
        message: "Files uploaded successfully",
        files: results,
      });
    } catch (error) {
      console.error("Error during upload:", error);
      return res.status(500).json({ error: "File upload failed" });
    }
  });
};

/*

Nota bene
Якщо ми завантажуємо файл у хмару, то Cloudinary автоматично додає розширення файлу до 
public_id (шлях, за яким будемо видаляти), якщо файл НЕ Є ЗОБРАЖЕННЯМ, а належить до 
категорії "raw", і натомість не додає, якщо він є зображенням. Тому видалення файлів з різними 
форматами ускладнене, бо треба кожного разу перевіряти, чи це image, чи це raw

*/

export const deleteAttachments = async files => {
  try {
    if (!files?.length) return;

    for (let file of files) {
      const filePathParts = file?.split("/")?.pop()?.split(".");
      const public_id = filePathParts[0]; // назва файлу без розширення
      const extension = filePathParts[1]?.toLowerCase(); // розширення файлу

      // перевіряємо тип файлу (image чи raw)
      if (imageFormats.includes(extension)) {
        // якщо файл - зображення, видаляємо без розширення
        await cloudinary.uploader.destroy(`attachments/${public_id}`);
      } else {
        // якщо файл - raw, видаляємо з розширенням
        await cloudinary.uploader.destroy(
          `attachments/${public_id}.${extension}`,
          {
            resource_type: "raw",
          }
        );
      }
    }
  } catch (error) {
    console.error(error);
    throw new Error("Failed to delete file");
  }
};
