const express = require('express');
const { getWeatherByLocation, getWeatherByCoords } = require('../controllers/weatherController');

const router = express.Router();

// New route for exact coordinates
router.get('/coords', getWeatherByCoords);

// Existing fallback route for city name strings
router.get('/:location', getWeatherByLocation);

module.exports = router;
