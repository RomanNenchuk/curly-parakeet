-- Створення таблиці тегів
CREATE TABLE tags (
    tag_id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

-- Створення асоціативної таблиці для зв'язку тем і тегів (багато-до-багатьох)
CREATE TABLE topic_tags (
    topic_id INT NOT NULL REFERENCES topics(topic_id) ON DELETE CASCADE,
    tag_id INT NOT NULL REFERENCES tags(tag_id) ON DELETE CASCADE,
    PRIMARY KEY (topic_id, tag_id)
);