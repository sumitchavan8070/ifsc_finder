const mysql = require('mysql2');

// Create a connection to the MySQL server (without specifying a database initially)
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root', // Replace with your MySQL username
  password: '', // Replace with your MySQL password
});

// Ensure the database exists and connect to it
const initializeDatabase = async () => {
  const dbName = 'bank_details';
  connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`, (err) => {
    if (err) {
      console.error('Error creating database:', err.message);
    } else {
      console.log(`Database "${dbName}" ensured to exist.`);
      // Switch connection to use the newly created database
      connection.changeUser({ database: dbName }, (err) => {
        if (err) {
          console.error('Error switching to database:', err.message);
        } else {
          console.log(`Connected to database "${dbName}".`);
        }
      });
    }
  });
};

// Call the initializeDatabase function
initializeDatabase();

module.exports = connection;
