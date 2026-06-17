-- Create database
CREATE DATABASE IF NOT EXISTS insurance_db;
USE insurance_db;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  phone VARCHAR(15) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('customer', 'admin') DEFAULT 'customer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- OTPs table
CREATE TABLE IF NOT EXISTS otps (
  phone VARCHAR(15) PRIMARY KEY,
  otp VARCHAR(6) NOT NULL,
  expiry TIMESTAMP NOT NULL
);

CREATE TABLE payment_details (
  payment_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  payment_mode ENUM('UPI', 'CARD', 'NET_BANKING') NOT NULL,
  upi_id VARCHAR(50),
  card_number VARCHAR(20),
  card_holder VARCHAR(100),
  expiry_date VARCHAR(10),
  bank_name VARCHAR(100),
  account_number VARCHAR(30),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE user_policies (
  policy_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  policy_name VARCHAR(100) NOT NULL,
  insurance_type VARCHAR(50) NOT NULL,
  coverage DECIMAL(12,2) NOT NULL,
  premium DECIMAL(10,2) NOT NULL,
  purchase_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  expiry_date DATETIME,
  term_years INT DEFAULT 1,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE payment_transactions (
  transaction_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  policy_id INT,
  amount DECIMAL(10,2) NOT NULL,
  payment_mode ENUM('UPI', 'CARD', 'NET_BANKING') NOT NULL,
  transaction_ref VARCHAR(100) UNIQUE,
  status ENUM('PENDING', 'SUCCESS', 'FAILED') DEFAULT 'PENDING',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (policy_id) REFERENCES user_policies(policy_id) ON DELETE SET NULL
);

CREATE TABLE payment_receipts (
  receipt_id INT AUTO_INCREMENT PRIMARY KEY,
  transaction_id INT NOT NULL,
  user_id INT NOT NULL,
  policy_id INT,
  amount DECIMAL(10,2) NOT NULL,
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (transaction_id) REFERENCES payment_transactions(transaction_id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS KYCRecords (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  documentType VARCHAR(50),
  filePath VARCHAR(255),
  status ENUM('Pending', 'Verified', 'Rejected') DEFAULT 'Pending',
  uploadedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE KYCRecords
ADD COLUMN memberId INT DEFAULT NULL AFTER userId;

ALTER TABLE KYCRecords
ADD COLUMN verified BOOLEAN DEFAULT FALSE AFTER status;

ALTER TABLE KYCRecords
ADD UNIQUE KEY unique_doc (userId, memberId, documentType);


CREATE TABLE IF NOT EXISTS FamilyMembers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  name VARCHAR(100) NOT NULL,
  relationship VARCHAR(50) NOT NULL, -- spouse, son, daughter, etc.
  age INT,
  occupation VARCHAR(100),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES Users(id) ON DELETE CASCADE
);

ALTER TABLE KYCRecords
ADD CONSTRAINT fk_member FOREIGN KEY (memberId) REFERENCES FamilyMembers(id) ON DELETE CASCADE;

ALTER TABLE Users
ADD COLUMN failedAttempts INT DEFAULT 0,
ADD COLUMN lockedUntil DATETIME NULL;

ALTER TABLE KYCRecords ADD COLUMN status ENUM('Verified','Pending','Rejected') DEFAULT 'Pending';
ALTER TABLE KYCRecords ADD COLUMN remarks VARCHAR(255);


