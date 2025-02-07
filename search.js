const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

const dataFilePath = path.join(__dirname, "/scrap/ifsc-code.json");

let cachedData = null;

function loadBankData() {
  if (cachedData) {
    return cachedData;
  }

  try {
    const data = fs.readFileSync(dataFilePath, "utf-8");
    cachedData = JSON.parse(data); // Cache the data
    return cachedData;
  } catch (error) {
    console.error("Error reading JSON file:", error);
    return [];
  }
}

router.get("/", async (req, res) => {
  const { ifsc } = req.query;

  if (!ifsc) {
    return res.status(400).json({ error: "IFSC code is required" });
  }

  const bankData = loadBankData();

  try {
    const result = bankData.filter(bank => bank.IFSC.startsWith(ifsc.toUpperCase()));
    if (!result) {
      return res
        .status(404)
        .json({ error: "Bank not found for the provided IFSC code" });
    }
    res.json({ success: true, data: result });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({
      success: false,
      message: "No Data Found",
    });
  }
});

module.exports = router;
