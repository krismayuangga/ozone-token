-- Ozone Staking Database Setup Script (Safe Version)
-- Run this in PHPMyAdmin - SQL tab
-- This version does NOT drop existing database

-- Use existing database
USE ozone_staking;

-- Drop tables if they exist (safe order to avoid foreign key constraints)
DROP TABLE IF EXISTS blockchain_events;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS stakes;
DROP TABLE IF EXISTS admin_settings;
DROP TABLE IF EXISTS pools;
DROP TABLE IF EXISTS users;

-- Users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    wallet_address VARCHAR(42) NOT NULL UNIQUE,
    email VARCHAR(255) NULL,
    username VARCHAR(50) NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    total_staked DECIMAL(36,18) DEFAULT 0,
    total_rewards DECIMAL(36,18) DEFAULT 0,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_wallet_address (wallet_address),
    INDEX idx_created_at (created_at)
);

-- Pools table (create before stakes for foreign key)
CREATE TABLE pools (
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_is_active (is_active),
    INDEX idx_token_address (token_address)
);

-- Stakes table
CREATE TABLE stakes (
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_wallet_address (wallet_address),
    INDEX idx_is_active (is_active),
    INDEX idx_user_id (user_id),
    INDEX idx_block_number (block_number),
    INDEX idx_tx_hash (tx_hash)
);

-- Transactions table
CREATE TABLE transactions (
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_wallet_address (wallet_address),
    INDEX idx_tx_hash (tx_hash),
    INDEX idx_type (type),
    INDEX idx_status (status),
    INDEX idx_block_number (block_number)
);

-- Blockchain events table
CREATE TABLE blockchain_events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_name VARCHAR(50) NOT NULL,
    contract_address VARCHAR(42) NOT NULL,
    tx_hash VARCHAR(66) NOT NULL,
    block_number BIGINT NOT NULL,
    block_hash VARCHAR(66) NOT NULL,
    log_index INT NOT NULL,
    event_data JSON NOT NULL,
    processed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_event_name (event_name),
    INDEX idx_contract_address (contract_address),
    INDEX idx_block_number (block_number),
    INDEX idx_processed (processed),
    UNIQUE KEY unique_event (tx_hash, log_index)
);

-- Admin settings table
CREATE TABLE admin_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT NOT NULL,
    description TEXT,
    updated_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Insert default pool
INSERT INTO pools (name, description, token_address, reward_rate, min_stake_amount, is_active) 
VALUES (
    'OZONE Staking Pool', 
    'Main OZONE token staking pool with competitive rewards',
    '0x8aE086CA4E4e24b616409c69Bd2bbFe7262AEe59',
    12.5,
    100,
    TRUE
);

-- Insert admin settings
INSERT INTO admin_settings (setting_key, setting_value, description) VALUES
('maintenance_mode', 'false', 'Enable/disable maintenance mode'),
('max_stake_amount', '100000', 'Maximum amount that can be staked'),
('fee_percentage', '0', 'Platform fee percentage'),
('emergency_pause', 'false', 'Emergency pause all operations');

-- Create sample admin user (your wallet address)
INSERT INTO users (wallet_address, username, is_admin, created_at) VALUES
('0x5cb928364f9474f9df8e2b28b8866d7a27a5a3d6', 'Admin', TRUE, NOW());

-- Create sample test user
INSERT INTO users (wallet_address, username, is_admin, created_at) VALUES
('0x1234567890123456789012345678901234567890', 'TestUser', FALSE, NOW());

-- Insert sample stake (your previous successful stake)
INSERT INTO stakes (
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

-- Insert sample transaction
INSERT INTO transactions (
    user_id,
    wallet_address,
    tx_hash,
    type,
    amount,
    block_number,
    status
) VALUES (
    1,
    '0x5cb928364f9474f9df8e2b28b8866d7a27a5a3d6',
    '0x38097cb78945ce3392d8470fa116e5ec107dfe93ba049f76db00810bd11be65c',
    'stake',
    '1000.000000000000000000',
    45123456,
    'confirmed'
);

-- Create additional indexes for performance
CREATE INDEX idx_stakes_user_active ON stakes(user_id, is_active);
CREATE INDEX idx_transactions_user_type ON transactions(user_id, type);
CREATE INDEX idx_events_contract_block ON blockchain_events(contract_address, block_number);

-- Show tables to verify
SHOW TABLES;

-- Show sample data
SELECT 'Users Table:' as table_info;
SELECT * FROM users;

SELECT 'Stakes Table:' as table_info;
SELECT * FROM stakes;

SELECT 'Pools Table:' as table_info;
SELECT * FROM pools;

SELECT 'Settings Table:' as table_info;
SELECT * FROM admin_settings;
