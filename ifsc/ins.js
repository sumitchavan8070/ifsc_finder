const mysql = require('mysql2');
const fs = require('fs');

// Create a MySQL connection pool
const pool = mysql.createPool({
  host: 'localhost',  // Your MySQL host
  user: 'root',       // Your MySQL user
  password: '', // Your MySQL password
  database: 'BankDetails' // Your MySQL database name
});

// Parse the JSON data
const jsonData = JSON.parse(fs.readFileSync('ifsc-code.json', 'utf8'));

// Function to insert data into MySQL
const insertData = async () => {
  for (const item of jsonData) {
    const query = `
      INSERT INTO bank_details (bank, ifsc, branch, centre, district, state, address, contact, imps, city, upi, micr, rtgs, neft, swift, iso3166)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const values = [
      item.BANK,
      item.IFSC,
      item.BRANCH,
      item.CENTRE,
      item.DISTRICT,
      item.STATE,
      item.ADDRESS,
      item.CONTACT,
      item.IMPS,
      item.CITY,
      item.UPI,
      item.MICR,
      item.RTGS,
      item.NEFT,
      item.SWIFT,
      item.ISO3166
    ];

    try {
      // Execute the query with the values
      await pool.promise().query(query, values);
      console.log(`Inserted data for ${item.BANK}`);
    } catch (error) {
      console.error('Error inserting data:', error);
    }
  }
};

// Call the insert function
insertData();
