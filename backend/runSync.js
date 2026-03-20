require('dotenv').config();
const mongoose = require('mongoose');
const syncPricesCore = require('./utils/marketSync');

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/kisan_mithr')
  .then(async () => {
    console.log("Connected to MongoDB. Starting sync...");
    try {
      const result = await syncPricesCore();
      console.log("Sync Result:", result);
    } catch (e) {
      console.error("Sync Error:", e);
    }
    process.exit(0);
  })
  .catch(err => {
    console.error("MongoDB Connection Error:", err);
    process.exit(1);
  });
