# MySQL Database Schema for Ozone Staking Platform
# Compatible with PHPMyAdmin

-- Create database
CREATE DATABASE IF NOT EXISTS ozone_staking CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE ozone_staking;

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

-- Pools table (for multiple staking pools)
CREATE TABLE pools (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    token_address VARCHAR(42) NOT NULL,
    reward_rate DECIMAL(8,4) DEFAULT 0, -- APY percentage
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

-- Events log table (for blockchain event indexing)
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
    12.5,  -- 12.5% APY
    100,   -- Minimum 100 OZONE
    TRUE
);

-- Insert default admin settings
INSERT INTO admin_settings (setting_key, setting_value, description) VALUES
('maintenance_mode', 'false', 'Enable/disable maintenance mode'),
('max_stake_amount', '100000', 'Maximum amount that can be staked'),
('fee_percentage', '0', 'Platform fee percentage'),
('emergency_pause', 'false', 'Emergency pause all operations');

-- Create indexes for better performance
CREATE INDEX idx_stakes_user_active ON stakes(user_id, is_active);
CREATE INDEX idx_transactions_user_type ON transactions(user_id, type);
CREATE INDEX idx_events_contract_block ON blockchain_events(contract_address, block_number);
