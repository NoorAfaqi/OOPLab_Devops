const mysql = require('mysql2/promise');
require('dotenv').config();

const setupAdmin = async () => {
  let connection;
  
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 3306
    });

    console.log('✅ Database connection established successfully.');

    // Add role column if it doesn't exist
    await connection.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS role ENUM('user', 'admin') DEFAULT 'user' AFTER last_login
    `);
    console.log('✅ Role column added to users table.');

    // Set user ID 14 as admin
    const [result] = await connection.query(
      'UPDATE users SET role = ? WHERE id = ?',
      ['admin', 14]
    );
    
    if (result.affectedRows > 0) {
      console.log('✅ User ID 14 set as admin successfully.');
    } else {
      console.log('⚠️  User ID 14 not found. Please create the user first.');
    }

    // Add index for role if it doesn't exist
    await connection.query(`
      CREATE INDEX IF NOT EXISTS idx_role ON users(role)
    `);
    console.log('✅ Index on role column created.');

  } catch (error) {
    console.error('❌ Error setting up admin:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

setupAdmin();

