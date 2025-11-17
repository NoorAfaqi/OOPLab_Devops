-- Add username field to users table
ALTER TABLE users 
ADD COLUMN username VARCHAR(50) UNIQUE AFTER email;

-- Add index for username for better performance
CREATE INDEX idx_username ON users(username);
