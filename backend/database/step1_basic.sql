-- Step 1: Create Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    wallet_address VARCHAR(42) NOT NULL UNIQUE,
    email VARCHAR(255) NULL,
    username VARCHAR(50) NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    total_staked DECIMAL(36,18) DEFAULT 0,
    total_rewards DECIMAL(36,18) DEFAULT 0,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Step 2: Create Pools table  
CREATE TABLE IF NOT EXISTS pools (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    token_address VARCHAR(42) NOT NULL,
    reward_rate DECIMAL(8,4) DEFAULT 0,
    min_stake_amount DECIMAL(36,18) DEFAULT 0,
    max_stake_amount DECIMAL(36,18) NULL,
    lock_period_days INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    total_staked DECIMAL(36,18) DEFAULT 0,
    total_stakers INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Step 3: Insert default pool
INSERT IGNORE INTO pools (name, description, token_address, reward_rate, min_stake_amount, is_active) 
VALUES (
    'OZONE Staking Pool', 
    'Main OZONE token staking pool with competitive rewards',
    '0x8aE086CA4E4e24b616409c69Bd2bbFe7262AEe59',
    12.5,
    100,
    TRUE
);

-- Step 4: Insert admin user
INSERT IGNORE INTO users (wallet_address, username, is_admin, created_at) VALUES
('0x5cb928364f9474f9df8e2b28b8866d7a27a5a3d6', 'Admin', TRUE, NOW());
