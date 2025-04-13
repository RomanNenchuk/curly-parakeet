CREATE TABLE topics (
    id SERIAL PRIMARY KEY, -- Унікальний ідентифікатор для кожного запису
    title VARCHAR(255) NOT NULL, -- Назва теми
    author VARCHAR(255) NOT NULL REFERENCES users(uid) ON DELETE CASCADE, -- Посилання на користувача
    tags TEXT[], -- Масив тегів
    description TEXT, -- Опис теми
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Час створення
    rating NUMERIC DEFAULT 0, -- Рейтинг теми
    status VARCHAR(50) CHECK (status IN ('active', 'archived')) DEFAULT 'active', -- Статус теми
    access_level VARCHAR(50) CHECK (access_level IN ('public', 'private')) DEFAULT 'public', -- Рівень доступу
    attachments TEXT[] -- Посилання на вкладення
);