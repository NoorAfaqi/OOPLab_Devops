-- Add created_at column to blog_likes table if it doesn't exist
ALTER TABLE blog_likes 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER user_id;

