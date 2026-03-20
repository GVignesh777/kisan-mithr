// import cron from "node-cron";
// import axios from "axios";
// import MarketPrice from "../models/MarketPrice.js";

const cron = require("node-cron");
const syncPricesCore = require("../utils/marketSync");

const startMarketPriceCron = () => {
    // Run the automatic API sync every 6 hours
    cron.schedule("0 */6 * * *", async () => {
        console.log("Updating market prices from AGMARKNET API / Auto Edit...");
        try {
            const result = await syncPricesCore();
            console.log(result.message, "- Records:", result.updatedRecords);
        } catch (error) {
            console.error("Cron job failed:", error.message);
        }
    });
};


module.exports = startMarketPriceCron;