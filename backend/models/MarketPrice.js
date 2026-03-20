// import mongoose from "mongoose";

const mongoose = require("mongoose");

const marketPriceSchema = new mongoose.Schema({
  commodity: String,
  state: String,
  district: String,
  market: String,
  min_price: Number,
  max_price: Number,
  modal_price: Number,
  arrival_date: String
});

marketPriceSchema.index({ state: 1, district: 1, commodity: 1 });

// export default mongoose.model("MarketPrice", marketPriceSchema);

const MarketPrices = mongoose.model("MarketPrices", marketPriceSchema);
module.exports = MarketPrices;
