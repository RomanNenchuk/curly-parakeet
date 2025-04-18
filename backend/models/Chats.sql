CREATE TABLE chats (
    id VARCHAR(255) PRIMARY KEY,
    user1_id VARCHAR(255) NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
    user2_id VARCHAR(255) NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user1_id, user2_id)
);
