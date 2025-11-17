-- Migration: Create blog_analytics table
-- Description: Stores aggregated analytics data for each blog

CREATE TABLE IF NOT EXISTS blog_analytics (
  id INT AUTO_INCREMENT PRIMARY KEY,
  blog_id INT NOT NULL,
  view_count INT DEFAULT 0,
  unique_view_count INT DEFAULT 0,
  referral_data JSON DEFAULT NULL,
  device_data JSON DEFAULT NULL,
  location_data JSON DEFAULT NULL,
  last_viewed_at DATETIME DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (blog_id) REFERENCES blogs(id) ON DELETE CASCADE,
  INDEX idx_blog_analytics_blog_id (blog_id),
  INDEX idx_blog_analytics_last_viewed (last_viewed_at),
  INDEX idx_blog_analytics_created (created_at),
  UNIQUE KEY unique_blog_analytics (blog_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
