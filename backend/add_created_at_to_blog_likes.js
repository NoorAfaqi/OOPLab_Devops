const mysql = require('mysql2/promise');
require('dotenv').config();

async function addCreatedAtColumn() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306
  });

  try {
    console.log('Checking blog_likes table structure...');
    
    // Check if created_at column exists
    const [columns] = await connection.execute(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'blog_likes' AND COLUMN_NAME = 'created_at'`,
      [process.env.DB_NAME]
    );

    if (columns.length > 0) {
      console.log('✅ created_at column already exists in blog_likes table');
    } else {
      console.log('⚠️  created_at column does NOT exist. Adding it...');
      
      // Add the column
      await connection.execute(
        `ALTER TABLE blog_likes 
         ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP AFTER user_id`
      );
      
      // Set existing rows to current timestamp
      await connection.execute(
        `UPDATE blog_likes SET created_at = NOW() WHERE created_at IS NULL`
      );
      
      console.log('✅ Successfully added created_at column to blog_likes table');
    }

    await connection.end();
    console.log('✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error:', error.message);
    await connection.end();
    process.exit(1);
  }
}

addCreatedAtColumn();

