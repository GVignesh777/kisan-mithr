const axios = require("axios");
const MarketPrice = require("../models/MarketPrice.js");

const API_KEY = process.env.DATA_GOV_API_KEY;

// Fetch prices from AGMARKNET API (Automated)
const fetchMarketPricesAuto = async (req, res) => {
  try {
    const response = await axios.get(
      `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070`,
      {
        params: {
          "api-key": API_KEY,
          format: "json",
          limit: 100
        }
      }
    );

    const records = response.data.records;
    console.log("records fetched from API:", records?.length);

    if (!records || records.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No market price data found"
      });
    }

    // clear old prices
    await MarketPrice.deleteMany({});

    // insert new prices
    await MarketPrice.insertMany(records);

    res.json({
      success: true,
      message: "Market prices updated successfully from data.gov.in",
      data: records
    });

  } catch (error) {
    console.error("Error fetching market prices:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch market prices"
    });
  }
};

// Send prices to frontend with optional geographic filters
const getMarketPrices = async (req, res) => {
  try {
    const { state, district, market, commodity } = req.query;
    let query = {};

    if (state) query.state = new RegExp(state, 'i');
    if (district) query.district = new RegExp(district, 'i');
    if (market) query.market = new RegExp(market, 'i');
    if (commodity) query.commodity = new RegExp(commodity, 'i');

    const prices = await MarketPrice.find(query).sort({ state: 1, district: 1 });

    res.json({
      success: true,
      data: prices,
      source: "Database"
    });

  } catch (error) {
    console.error("Error in getMarketPrices:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching prices"
    });
  }
};

// Get unique locations (State, District, Market) for frontend dropdowns
const getMarketLocations = async (req, res) => {
    try {
        const states = await MarketPrice.distinct('state');
        const districts = await MarketPrice.distinct('district');
        const markets = await MarketPrice.distinct('market');

        res.json({
            success: true,
            data: {
                states: states.filter(Boolean),
                districts: districts.filter(Boolean),
                markets: markets.filter(Boolean)
            }
        });
    } catch (error) {
        console.error("Error in getMarketLocations:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch market locations"
        });
    }
}

// Manually update a specific market price by ID
const updateMarketPriceManual = async (req, res) => {
    try {
        const { id } = req.params;
        const { min_price, max_price, modal_price } = req.body;

        const updatedPrice = await MarketPrice.findByIdAndUpdate(
            id,
            { min_price, max_price, modal_price },
            { new: true, runValidators: true }
        );

        if (!updatedPrice) {
            return res.status(404).json({ success: false, message: "Market price record not found" });
        }

        res.json({
            success: true,
            message: "Market price manually updated",
            data: updatedPrice
        });
    } catch (error) {
        console.error("Error updating manual market price:", error);
        res.status(500).json({ success: false, message: "Failed to manually update price" });
    }
}

module.exports = { 
    fetchMarketPricesAuto, 
    getMarketPrices, 
    getMarketLocations,
    updateMarketPriceManual
};
