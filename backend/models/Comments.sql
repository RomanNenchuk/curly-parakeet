CREATE TABLE comments (
    id SERIAL PRIMARY KEY, -- Унікальний ідентифікатор для кожного коментаря
    content TEXT NOT NULL, -- Текст коментаря
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    attachment_url TEXT,
    author_id VARCHAR(255) NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
    topic_id INT NOT NULL REFERENCES topics(id) ON DELETE CASCADE
);