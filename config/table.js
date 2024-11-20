const tables = [
  `
    CREATE TABLE IF NOT EXISTS User (
        user_id BIGINT AUTO_INCREMENT PRIMARY KEY,
        birth DATE NOT NULL,
        username VARCHAR(255) NOT NULL,
        password VARCHAR(255) NOT NULL,
        school_auth VARCHAR(255),
        parent_id BIGINT
    )
    `,
  `
    CREATE TABLE IF NOT EXISTS Mission (
        mission_id BIGINT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        status VARCHAR(50) NOT NULL,
        user_id BIGINT,
        FOREIGN KEY (user_id) REFERENCES User(user_id)
    )
    `,
  `
    CREATE TABLE IF NOT EXISTS Account (
        account_id BIGINT AUTO_INCREMENT PRIMARY KEY,
        user_id BIGINT,
        FOREIGN KEY (user_id) REFERENCES User(user_id)
    )
    `,
  `
    CREATE TABLE IF NOT EXISTS SubAccount (
        sub_account_id BIGINT AUTO_INCREMENT PRIMARY KEY,
        sub_account_usage VARCHAR(255) NOT NULL,
        account_id BIGINT,
        FOREIGN KEY (account_id) REFERENCES Account(account_id)
    )
    `,
  `
    CREATE TABLE IF NOT EXISTS History (
        history_id BIGINT AUTO_INCREMENT PRIMARY KEY,
        date DATE NOT NULL,
        time TIME NOT NULL,
        transaction_type VARCHAR(50) NOT NULL,
        account_holder VARCHAR(255) NOT NULL,
        account_number VARCHAR(255) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        photo VARCHAR(255),
        account_id BIGINT,
        FOREIGN KEY (account_id) REFERENCES Account(account_id)
    )
    `,
  `
    CREATE TABLE IF NOT EXISTS SubAccountHistory (
        sub_history_id BIGINT AUTO_INCREMENT PRIMARY KEY,
        date DATE NOT NULL,
        time TIME NOT NULL,
        transaction_type VARCHAR(50) NOT NULL,
        account_holder VARCHAR(255) NOT NULL,
        account_number VARCHAR(255) NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        sub_account_id BIGINT,
        FOREIGN KEY (sub_account_id) REFERENCES SubAccount(sub_account_id)
    )
    `,
  `
    CREATE TABLE IF NOT EXISTS ActivityLog (
        log_id BIGINT AUTO_INCREMENT PRIMARY KEY,
        activity_type VARCHAR(50) NOT NULL,
        referenced_id BIGINT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        is_read BOOLEAN DEFAULT FALSE,
        user_id BIGINT,
        FOREIGN KEY (user_id) REFERENCES User(user_id)
    )
    `,
  `
    CREATE TABLE IF NOT EXISTS Purchase (
        purchase_id BIGINT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        end_date DATE NOT NULL,
        status VARCHAR(50) NOT NULL,
        user_id BIGINT,
        FOREIGN KEY (user_id) REFERENCES User(user_id)
    )
    `,
  `
    CREATE TABLE IF NOT EXISTS PurchaseUser (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        user_id  BIGINT,
        purchase_id BIGINT,
        FOREIGN KEY (purchase_id) REFERENCES Purchase(purchase_id)
    )
    `,
  `
    CREATE TABLE IF NOT EXISTS Comment (
        comment_id BIGINT AUTO_INCREMENT PRIMARY KEY,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        purchase_id BIGINT,
        FOREIGN KEY (purchase_id) REFERENCES Purchase(purchase_id)
    )
    `,
];

module.exports = tables;
