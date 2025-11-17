const mysql = require('mysql2/promise');
require('dotenv').config();
const fs = require('fs');
const path = require('path');

async function setupSubscribersTable() {
  let connection;

  try {
    // Create connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      multipleStatements: true
    });

    console.log('✅ Connected to database');

    // Read the SQL migration file
    const sqlPath = path.join(__dirname, 'create_subscribers_table.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Execute the SQL
    await connection.query(sql);
    console.log('✅ SUBSCRIBERS table created successfully');

    // Verify the table was created
    const [tables] = await connection.query('SHOW TABLES LIKE "SUBSCRIBERS"');
    
    if (tables.length > 0) {
      console.log('✅ SUBSCRIBERS table exists');
      
      // Get table structure
      const [columns] = await connection.query('DESCRIBE SUBSCRIBERS');
      console.log('\n📋 Table structure:');
      console.table(columns);
    }

  } catch (error) {
    console.error('❌ Error creating SUBSCRIBERS table:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('✅ Database connection closed');
    }
  }
}

// Run the setup
setupSubscribersTable()
  .then(() => {
    console.log('\n🎉 Setup completed successfully!');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  });

