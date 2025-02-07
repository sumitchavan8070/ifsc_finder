const db = require('./db');
const express = require("express");
const router = express.Router();
const mysql = require('mysql2');

const fs = require("fs");
const path = require("path");

const dataFilePath = path.join(__dirname, "/ifsc-code.json");




// Create the table
const createTable = () => {
    const query = `
    CREATE TABLE IF NOT EXISTS BankDetails (
      IFSC VARCHAR(11) PRIMARY KEY,
      BANK VARCHAR(255),
      BRANCH VARCHAR(255),
      CENTRE VARCHAR(100),
      DISTRICT VARCHAR(100),
      STATE VARCHAR(100),
      ADDRESS TEXT,
      CONTACT VARCHAR(20),
      IMPS BOOLEAN,
      CITY VARCHAR(100),
      UPI BOOLEAN,
      MICR VARCHAR(9),
      RTGS BOOLEAN,
      NEFT BOOLEAN,
      SWIFT VARCHAR(50),
      ISO3166 VARCHAR(10)
    );
  `;
    db.query(query, (err, result) => {
        if (err) {
            console.error('Error creating table:', err.message);
        } else {
            console.log('Table created successfully or already exists.');
        }
    });
};

// Insert data
const insertData = async () => {
    const rawData = fs.readFileSync(dataFilePath, "utf-8");
    let data;

    try {
        data = JSON.parse(rawData);
    } catch (err) {
        console.error("Error parsing JSON:", err.message);
        return;
    }

    if (!Array.isArray(data)) {
        console.error("Parsed data is not an array.");
        return;
    }

    const chunkSize = 100; // Adjust based on database performance
    for (let i = 0; i < data.length; i += chunkSize) {
        const chunk = data.slice(i, i + chunkSize);
        const values = chunk.map((record) => [
            record.IFSC,
            record.BANK,
            record.BRANCH,
            record.CENTRE,
            record.DISTRICT,
            record.STATE,
            record.ADDRESS,
            record.CONTACT,
            record.IMPS,
            record.CITY,
            record.UPI,
            record.MICR,
            record.RTGS,
            record.NEFT,
            record.SWIFT,
            record.ISO3166,
        ]);

        const query = `
            INSERT INTO BankDetails (
                IFSC, BANK, BRANCH, CENTRE, DISTRICT, STATE, ADDRESS, CONTACT, IMPS, CITY, UPI, MICR, RTGS, NEFT, SWIFT, ISO3166
            ) VALUES ?;
        `;

        try {
            const [result] = await db.query(query, [values]);
            console.log(`Inserted ${result.affectedRows} rows.`);
        } catch (err) {
            console.error("Error inserting chunk:", err.message);
        }
    }
};





router.get("/", async (req, res) => {
    // Run functions

    createTable();
    insertData();
});

module.exports = router;




