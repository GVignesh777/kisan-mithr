require('dotenv').config();
const axios = require('axios');
const nasaService = require('./services/nasaService');

// Mock simple scenario: first attempt fails with 503, second succeeds
// Note: We are using the real nasaService which uses axios.
// For a simple script, we can just observe real behavior or manually mock for this test.

async function testResilience() {
    console.log("--- STARTING NASA RESILIENCE TEST ---");
    
    // Test parameters (Hyderabad)
    const lat = 17.3850;
    const lon = 78.4867;
    const date = new Date().toISOString().split('T')[0];

    console.log(`Testing Earth Imagery with fallback logic for ${date}...`);
    try {
        const imagery = await nasaService.getEarthImagery(lat, lon, date);
        if (imagery) {
            console.log("SUCCESS: Imagery data retrieved.");
            console.log("URL:", imagery.url);
            console.log("Date used:", imagery.date);
        } else {
            console.log("FAILED: No imagery retrieved after all retries and fallbacks.");
        }
    } catch (err) {
        console.error("TEST ERROR:", err.message);
    }

    console.log("\nTesting POWER API with retry logic...");
    try {
        const powerData = await nasaService.getPowerData(lat, lon, '2023-11-01', '2023-11-05');
        if (powerData) {
            console.log("SUCCESS: POWER data retrieved.");
        }
    } catch (err) {
        console.error("TEST ERROR:", err.message);
    }

    console.log("--- TEST COMPLETE ---");
}

testResilience();
