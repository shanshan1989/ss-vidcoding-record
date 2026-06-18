-- =====================================================
-- 随手记账数据库初始化脚本
-- 版本：V1.0.1
-- 日期：2026/06/18
-- =====================================================

-- 创建数据库
CREATE DATABASE IF NOT EXISTS suishouji
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE suishouji;

-- 设置字符集为 utf8mb4
SET NAMES utf8mb4;

-- =====================================================
-- 1. 用户表
-- =====================================================
DROP TABLE IF EXISTS backups;
DROP TABLE IF EXISTS reminders;
DROP TABLE IF EXISTS budgets;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS accounts;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  nickname VARCHAR(50) NULL,
  avatar_url VARCHAR(500) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_login_at DATETIME NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  INDEX idx_username (username),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 2. 分类表
-- =====================================================
CREATE TABLE categories (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NULL,
  type ENUM('expense','income') NOT NULL,
  name VARCHAR(50) NOT NULL,
  icon VARCHAR(100) NOT NULL,
  color VARCHAR(7) NULL,
  parent_id VARCHAR(36) NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_system TINYINT(1) NOT NULL DEFAULT 0,
  is_hidden TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_type (user_id, type),
  INDEX idx_parent (parent_id),
  INDEX idx_sort_order (sort_order),
  CONSTRAINT fk_category_parent FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 3. 账户表
-- =====================================================
CREATE TABLE accounts (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  name VARCHAR(50) NOT NULL,
  type ENUM('cash','electronic','bank','credit','other') NOT NULL,
  icon VARCHAR(100) NULL,
  initial_balance DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  current_balance DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  is_default TINYINT(1) NOT NULL DEFAULT 0,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  sort_order INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_is_default (is_default),
  INDEX idx_sort_order (sort_order),
  CONSTRAINT fk_account_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 4. 账单表
-- =====================================================
CREATE TABLE transactions (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  type ENUM('expense','income','transfer') NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  category_id VARCHAR(36) NULL,
  account_id VARCHAR(36) NOT NULL,
  to_account_id VARCHAR(36) NULL,
  transaction_date DATE NOT NULL,
  transaction_time TIME NULL,
  note VARCHAR(500) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  is_deleted TINYINT(1) NOT NULL DEFAULT 0,
  INDEX idx_user_id (user_id),
  INDEX idx_user_date (user_id, transaction_date),
  INDEX idx_user_category (user_id, category_id),
  INDEX idx_type (type),
  INDEX idx_is_deleted (is_deleted),
  CONSTRAINT fk_transaction_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_transaction_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  CONSTRAINT fk_transaction_account FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
  CONSTRAINT fk_transaction_to_account FOREIGN KEY (to_account_id) REFERENCES accounts(id) ON DELETE SET NULL,
  CONSTRAINT chk_amount_positive CHECK (amount > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 5. 预算表
-- =====================================================
CREATE TABLE budgets (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  `year_month` VARCHAR(7) NOT NULL,
  category_id VARCHAR(36) NULL,
  budget_amount DECIMAL(12,2) NOT NULL,
  alert_threshold DECIMAL(5,2) NOT NULL DEFAULT 80.00,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_month (user_id, `year_month`),
  INDEX idx_user_category_month (user_id, category_id, `year_month`),
  UNIQUE KEY uk_user_category_month (user_id, category_id, `year_month`),
  CONSTRAINT fk_budget_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_budget_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 6. 提醒表
-- =====================================================
CREATE TABLE reminders (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  reminder_time TIME NOT NULL,
  reminder_message VARCHAR(200) NULL,
  is_enabled TINYINT(1) NOT NULL DEFAULT 1,
  exclude_weekends TINYINT(1) NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  CONSTRAINT fk_reminder_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 7. 备份记录表
-- =====================================================
CREATE TABLE backups (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  backup_type ENUM('manual','auto') NOT NULL,
  file_url VARCHAR(500) NULL,
  file_size BIGINT NULL,
  status ENUM('success','failed') NOT NULL,
  error_message VARCHAR(500) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at),
  CONSTRAINT fk_backup_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- 插入默认数据
-- =====================================================

-- 插入系统默认支出分类
INSERT INTO categories (id, user_id, type, name, icon, color, sort_order, is_system) VALUES
('cat_e1', NULL, 'expense', '餐饮', 'restaurant', '#FF5722', 1, 1),
('cat_e2', NULL, 'expense', '交通', 'directions_car', '#4CAF50', 2, 1),
('cat_e3', NULL, 'expense', '购物', 'shopping_bag', '#9C27B0', 3, 1),
('cat_e4', NULL, 'expense', '居家', 'home', '#795548', 4, 1),
('cat_e5', NULL, 'expense', '娱乐', 'movie', '#E91E63', 5, 1),
('cat_e6', NULL, 'expense', '医疗', 'medical_services', '#F44336', 6, 1),
('cat_e7', NULL, 'expense', '教育', 'school', '#2196F3', 7, 1),
('cat_e8', NULL, 'expense', '其他', 'more_horiz', '#607D8B', 8, 1);

-- 插入系统默认收入分类
INSERT INTO categories (id, user_id, type, name, icon, color, sort_order, is_system) VALUES
('cat_i1', NULL, 'income', '工资', 'payments', '#4CAF50', 1, 1),
('cat_i2', NULL, 'income', '劳务', 'work', '#8BC34A', 2, 1),
('cat_i3', NULL, 'income', '外快', 'monetization_on', '#CDDC39', 3, 1),
('cat_i4', NULL, 'income', '奖金', 'redeem', '#FF9800', 4, 1),
('cat_i5', NULL, 'income', '理财', 'trending_up', '#009688', 5, 1),
('cat_i6', NULL, 'income', '红包', 'card_giftcard', '#E91E63', 6, 1),
('cat_i7', NULL, 'income', '退款', 'replay', '#00BCD4', 7, 1),
('cat_i8', NULL, 'income', '其他', 'more_horiz', '#607D8B', 8, 1);

-- 插入测试用户 (密码: 123456, bcrypt加密)
INSERT INTO users (id, username, password_hash, nickname, created_at) VALUES
('user_test', 'test', '$2a$10$N9qo8uLOickgx2ZMRZoMy.Mrq4L0p5Vh3.5u5VxVL5gF7LQoF6OXG', '测试用户', NOW());

-- 插入测试用户的默认账户
INSERT INTO accounts (id, user_id, name, type, icon, initial_balance, current_balance, is_default, sort_order) VALUES
('acc_1', 'user_test', '现金', 'cash', 'payments', 0.00, 0.00, 1, 1),
('acc_2', 'user_test', '微信钱包', 'electronic', 'chat', 0.00, 0.00, 0, 2),
('acc_3', 'user_test', '支付宝', 'electronic', 'account_balance_wallet', 0.00, 0.00, 0, 3),
('acc_4', 'user_test', '银行卡', 'bank', 'credit_card', 0.00, 0.00, 0, 4),
('acc_5', 'user_test', '信用卡', 'credit', 'credit_card', 0.00, 0.00, 0, 5);

-- 插入测试数据 - 账单
INSERT INTO transactions (id, user_id, type, amount, category_id, account_id, transaction_date, transaction_time, note) VALUES
('tx_1', 'user_test', 'expense', 35.00, 'cat_e1', 'acc_3', CURDATE(), '12:30:00', '午餐'),
('tx_2', 'user_test', 'expense', 8.50, 'cat_e2', 'acc_2', CURDATE(), '08:15:00', '地铁'),
('tx_3', 'user_test', 'income', 5000.00, 'cat_i1', 'acc_4', DATE_SUB(CURDATE(), INTERVAL 1 DAY), '09:00:00', '工资发放'),
('tx_4', 'user_test', 'expense', 128.00, 'cat_e5', 'acc_1', DATE_SUB(CURDATE(), INTERVAL 1 DAY), '20:00:00', '电影票'),
('tx_5', 'user_test', 'expense', 45.00, 'cat_e3', 'acc_2', DATE_SUB(CURDATE(), INTERVAL 2 DAY), '15:30:00', '日用品');

-- 插入测试用户的预算
INSERT INTO budgets (id, user_id, `year_month`, category_id, budget_amount, alert_threshold) VALUES
('bud_1', 'user_test', DATE_FORMAT(CURDATE(), '%Y-%m'), NULL, 5000.00, 80.00),
('bud_2', 'user_test', DATE_FORMAT(CURDATE(), '%Y-%m'), 'cat_e1', 1500.00, 80.00);

-- 插入测试用户的提醒设置
INSERT INTO reminders (id, user_id, reminder_time, reminder_message, is_enabled, exclude_weekends) VALUES
('rem_1', 'user_test', '21:00:00', '今天记账了吗？', 1, 0);

-- =====================================================
-- 完成
-- =====================================================
