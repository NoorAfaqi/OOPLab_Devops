-- Add role column to users table
ALTER TABLE users 
ADD COLUMN role ENUM('user', 'admin') DEFAULT 'user' AFTER last_login;

-- Set user ID 14 as admin
UPDATE users SET role = 'admin' WHERE id = 14;

-- Add index for role
CREATE INDEX idx_role ON users(role);

