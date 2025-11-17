const { sequelize, Contact } = require('./src/models');
const { testConnection } = require('./src/config/database');

const setupContactsTable = async () => {
  await testConnection();
  try {
    await Contact.sync({ alter: true });
    console.log('✅ Contacts table checked/created successfully.');
  } catch (error) {
    console.error('❌ Error setting up contacts table:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
};

setupContactsTable();

