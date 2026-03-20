const express = require('express');
const { 
    analyzeSatelliteIndices, 
    getNasaImagery,
    getNasaApod,
    getSatelliteData
} = require('../controllers/satelliteController');
const router = express.Router();

router.post('/analyze', analyzeSatelliteIndices);
router.post('/nasa-imagery', getNasaImagery);
router.get('/nasa-apod', getNasaApod);
router.post('/data', getSatelliteData);

module.exports = router;
