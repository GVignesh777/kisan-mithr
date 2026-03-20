const MarketPrice = require('../../models/MarketPrice');
const syncPricesCore = require('../../utils/marketSync');

// Note: Ensure MarketPrice model exists or adapts to the existing schema
const getMarketPrices = async (req, res) => {
  try {
    const prices = await MarketPrice.find({}).sort({ updatedAt: -1 });
    res.json(prices);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching market prices', error: error.message });
  }
};

const addMarketPrice = async (req, res) => {
  try {
    const { state, district, market, commodity, variety, min_price, max_price, modal_price } = req.body;
    const price = new MarketPrice({
      state, district, market, commodity, variety, min_price, max_price, modal_price
    });
    const createdPrice = await price.save();
    res.status(201).json(createdPrice);
  } catch (error) {
    res.status(500).json({ message: 'Error adding market price', error: error.message });
  }
};

const updateMarketPrice = async (req, res) => {
  try {
    const { state, district, market, commodity, variety, min_price, max_price, modal_price } = req.body;
    const price = await MarketPrice.findById(req.params.id);
    
    if (price) {
      price.state = state || price.state;
      price.district = district || price.district;
      price.market = market || price.market;
      price.commodity = commodity || price.commodity;
      price.variety = variety || price.variety;
      price.min_price = min_price || price.min_price;
      price.max_price = max_price || price.max_price;
      price.modal_price = modal_price || price.modal_price;
      
      const updatedPrice = await price.save();
      res.json(updatedPrice);
    } else {
      res.status(404).json({ message: 'Price record not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error updating market price', error: error.message });
  }
};

const deleteMarketPrice = async (req, res) => {
  try {
    const price = await MarketPrice.findById(req.params.id);
    if (!price) return res.status(404).json({ message: 'Price not found' });

    await MarketPrice.findByIdAndDelete(req.params.id);
    res.json({ message: 'Price record deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting market price', error: error.message });
  }
};

const syncMarketPrices = async (req, res) => {
  try {
    const result = await syncPricesCore();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error syncing market prices', error: error.message });
  }
};

module.exports = {
  getMarketPrices,
  addMarketPrice,
  updateMarketPrice,
  deleteMarketPrice,
  syncMarketPrices
};
