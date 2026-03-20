const express = require("express");
const { 
  fetchMarketPricesAuto, 
  getMarketPrices, 
  getMarketLocations,
  updateMarketPriceManual 
} = require("../controllers/marketController");
const { submitRating, getRatings } = require("../controllers/cropRatingController");

const router = express.Router();

// Get unique locations for dropdowns
router.get("/locations", getMarketLocations);

// Fetch prices from API and store in DB (Automated Trigger)
router.get("/update-auto", fetchMarketPricesAuto);

// Manual update by admin
router.put("/update-manual/:id", updateMarketPriceManual);

// Get prices for frontend (with optional ?state=&district=&market=&commodity= queries)
// Place this last so it doesn't intercept /locations or /update-auto
router.get("/prices", getMarketPrices);

// Crop Ratings
router.get("/ratings/:cropId", getRatings);
router.post("/ratings", submitRating);

module.exports = router;
