const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
const TelegramBot = require("node-telegram-bot-api");

// ✅ Telegram Bot Details
const BOT_TOKEN = "7814658922:AAEoaNZVspGN4QD5Jdm-peE45a9tYldIYRQ";
const CHANNEL_USERNAMES = ["@latestipodaily"]; // Add more channels if needed

// ✅ Groww IPO API URL
const API_URL = "https://groww.in/v1/api/stocks_primary_market_data/v2/ipo/all";

// ✅ Function to Fetch IPO Data from API
async function getIPOs() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      console.error("Failed to fetch IPO data");
      return {};
    }

    const ipoData = await response.json();

    // Extract IPO categories
    const categorizedIPOs = {
      active: ipoData.ipoCompanyListingOrderMap.ACTIVE || [],
      closed: ipoData.ipoCompanyListingOrderMap.CLOSED || [],
      upcoming: ipoData.ipoCompanyListingOrderMap.UPCOMING || [],
      listed: ipoData.ipoCompanyListingOrderMap.LISTED || [],
    };

    // Process IPO data
    const processedIPOs = {};
    Object.keys(categorizedIPOs).forEach((category) => {
      processedIPOs[category] = categorizedIPOs[category]
        .slice(0, 5)
        .map((ipo) => ({
          company_name: ipo.growwShortName || "N/A",
          open_date: ipo.biddingStartDate || "N/A",
          close_date: ipo.biddingEndDate || "N/A",
          price_band: `₹${ipo.minPrice || "N/A"} - ₹${ipo.maxPrice || "N/A"}`,
          subscription_rate: ipo.totalSubscriptionRate || "N/A",
          lot_size: ipo.lotSize || "N/A",
          listing_date: ipo.listingDate || "N/A",
          logo_url: ipo.logoUrl || "",
          regular_details:
            (ipo.categories &&
              ipo.categories.find((cat) => cat.category === "IND")
                ?.categoryDetails?.categoryInfo?.[0]) ||
            "N/A",
          hni_details:
            (ipo.categories &&
              ipo.categories.find((cat) => cat.category === "HNI")
                ?.categoryDetails?.categoryInfo?.[0]) ||
            "N/A",
        }));
    });

    return processedIPOs;
  } catch (error) {
    console.error("Error fetching IPO data:", error);
    return {};
  }
}

// ✅ Function to Post IPO Updates on Telegram
async function postIPOs() {
  const bot = new TelegramBot(BOT_TOKEN, { polling: false });
  const categorizedIPOs = await getIPOs();

  const todayDate = new Date().toLocaleDateString("en-GB"); // Format: DD-MM-YYYY

  // Check if there are any IPOs to post
  if (!Object.values(categorizedIPOs).some((ipos) => ipos.length > 0)) {
    for (const channel of CHANNEL_USERNAMES) {
      await bot.sendMessage(
        channel,
        "⚠️ *No new IPO information available today.*",
        { parse_mode: "Markdown" }
      );
    }
    return false; // No IPOs to post
  }

  // Generate messages for each category
  const messages = [];
  for (const [category, ipos] of Object.entries(categorizedIPOs)) {
    if (ipos.length === 0) continue;

    let message = `🎯🚀 *IPO Updates (${todayDate}) - ${category.toUpperCase()} IPOs* 📢\n\n✨ *New IPO Information Available!* ✨\n-----------------------------\n\n`;

    ipos.forEach((ipo, idx) => {
      message += `📌 *${idx + 1}. ${ipo.company_name}*\n`;
      message += `📅 Open Date: \`${ipo.open_date}\`\n`;
      message += `📅 Close Date: \`${ipo.close_date}\`\n`;
      message += `📊 Price Band: \`${ipo.price_band}\`\n`;
      message += `📈 Subscription Rate: \`${ipo.subscription_rate}\`\n`;
      message += `📦 Lot Size: \`${ipo.lot_size}\`\n`;
      message += `📋 Listing Date: \`${ipo.listing_date}\`\n`;
      message += `👤 Regular Application: \`${ipo.regular_details}\`\n`;
      message += `👤 HNI Application: \`${ipo.hni_details}\`\n`;
      message += `🖼️ Logo: [Click Here](${ipo.logo_url})\n`;
      message += `-----------------------------\n`;
    });

    messages.push(message);
  }

  // Send messages to all Telegram channels
  for (const channel of CHANNEL_USERNAMES) {
    for (const msg of messages) {
      await bot.sendMessage(channel, msg, { parse_mode: "Markdown" });
    }
  }

  return true; // IPOs posted successfully
}

// ✅ Route to Trigger IPO Posting
router.get("/", async (req, res) => {
  try {
    const success = await postIPOs(); // Await the result of postIPOs()
    if (success) {
      res.json({
        success: true,
        message: "IPO messages sent successfully on Telegram",
      });
    } else {
      res.status(404).json({
        success: false,
        message: "No IPO data found to send",
      });
    }
  } catch (error) {
    console.error("Error in IPO posting route:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while processing the request",
    });
  }
});

module.exports = router;