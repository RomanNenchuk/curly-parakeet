CREATE TABLE emoji (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    icon VARCHAR(255) -- Наприклад, "👍", "❤️"
    score INTEGER NOT NULL
);

CREATE TABLE topic_reactions (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
    topic_id INT NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    emoji_id INT NOT NULL REFERENCES emoji(id) ON DELETE CASCADE,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, topic_id)
);

CREATE TABLE comment_reactions (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
    comment_id INT NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
    emoji_id INT NOT NULL REFERENCES emoji(id) ON DELETE CASCADE,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, comment_id)
);
