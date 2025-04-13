CREATE TABLE users (
    uid VARCHAR(255) NOT NULL,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    avatar VARCHAR(255),
    bio TEXT,
    created_at DATE DEFAULT CURRENT_DATE,
    CONSTRAINT users_pkey PRIMARY KEY (uid),
    CONSTRAINT users_email_key UNIQUE (email)
);

CREATE TABLE user_subscriptions (
    user_id VARCHAR(255) NOT NULL, -- ідентифікатор користувача, який є підписником
    subscription_id VARCHAR(255) NOT NULL, -- ідентифікатор користувача, на якого підписується підписник
    CONSTRAINT user_subscriptions_pkey PRIMARY KEY (user_id, subscription_id),
    CONSTRAINT user_subscriptions_user_id_fkey FOREIGN KEY (user_id) REFERENCES users (uid) ON DELETE CASCADE,
    CONSTRAINT user_subscriptions_subscription_id_fkey FOREIGN KEY (subscription_id) REFERENCES users (uid) ON DELETE CASCADE
);
