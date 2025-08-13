-- Step 5: Create Stakes table (run after step1_basic.sql)
CREATE TABLE IF NOT EXISTS stakes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    wallet_address VARCHAR(42) NOT NULL,
    stake_id INT NOT NULL,
    amount DECIMAL(36,18) NOT NULL,
    staked_at TIMESTAMP NOT NULL,
    unstaked_at TIMESTAMP NULL,
    tx_hash VARCHAR(66) NOT NULL,
    block_number BIGINT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    pool_id INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Step 6: Create Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    wallet_address VARCHAR(42) NOT NULL,
    tx_hash VARCHAR(66) NOT NULL UNIQUE,
    type ENUM('stake', 'unstake', 'reward', 'approval') NOT NULL,
    amount DECIMAL(36,18) NULL,
    block_number BIGINT NULL,
    gas_used BIGINT NULL,
    gas_price DECIMAL(36,18) NULL,
    status ENUM('pending', 'confirmed', 'failed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Step 7: Create other tables
CREATE TABLE IF NOT EXISTS blockchain_events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_name VARCHAR(50) NOT NULL,
    contract_address VARCHAR(42) NOT NULL,
    tx_hash VARCHAR(66) NOT NULL,
    block_number BIGINT NOT NULL,
    block_hash VARCHAR(66) NOT NULL,
    log_index INT NOT NULL,
    event_data JSON NOT NULL,
    processed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT NOT NULL,
    description TEXT,
    updated_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Step 8: Insert sample data
INSERT IGNORE INTO stakes (
    user_id, 
    wallet_address, 
    stake_id, 
    amount, 
    staked_at, 
    tx_hash, 
    block_number, 
    is_active
) VALUES (
    1,
    '0x5cb928364f9474f9df8e2b28b8866d7a27a5a3d6',
    1,
    '1000.000000000000000000',
    NOW(),
    '0x38097cb78945ce3392d8470fa116e5ec107dfe93ba049f76db00810bd11be65c',
    45123456,
    TRUE
);

INSERT IGNORE INTO admin_settings (setting_key, setting_value, description) VALUES
('maintenance_mode', 'false', 'Enable/disable maintenance mode'),
('max_stake_amount', '100000', 'Maximum amount that can be staked'),
('fee_percentage', '0', 'Platform fee percentage'),
('emergency_pause', 'false', 'Emergency pause all operations');

-- Verify setup
SHOW TABLES;
SELECT COUNT(*) as user_count FROM users;
SELECT COUNT(*) as stakes_count FROM stakes;
