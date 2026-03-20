require('dotenv').config();
const axios = require('axios');

const NASA_API_KEY = process.env.NASA_API_KEY || 'DEMO_KEY';
const lat = 17.3850;
const lon = 78.4867;

async function testImagery() {
    console.log("Testing NASA Earth Imagery with different dates...");
    
    // Try current date and last 10 days
    for (let i = 0; i < 10; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        
        console.log(`\nTrying Date: ${dateStr}`);
        try {
            const response = await axios.get('https://api.nasa.gov/planetary/earth/assets', {
                params: {
                    lon: lon,
                    lat: lat,
                    date: dateStr,
                    dim: 0.1,
                    api_key: NASA_API_KEY
                },
                timeout: 10000
            });
            console.log("Status:", response.status);
            console.log("Data:", JSON.stringify(response.data, null, 2));
            if (response.data.url) {
                console.log("SUCCESS found image!");
                break;
            }
        } catch (error) {
            console.error("Error:", error.response ? `${error.response.status} - ${JSON.stringify(error.response.data)}` : error.message);
        }
    }
}

testImagery();
