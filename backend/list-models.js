const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

async function listGroqModels() {
    const apiKey = process.env.GROQ_API_KEY;
    try {
        const response = await axios.get(
            "https://api.groq.com/openai/v1/models",
            {
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                },
            }
        );

        const fs = require('fs');
        const models = response.data.data.map(m => m.id);
        fs.writeFileSync('models.json', JSON.stringify(models, null, 2));
        console.log("Models written to models.json");
    } catch (error) {
        console.error("Error status:", error.response?.status);
        console.log("Error data:", JSON.stringify(error.response?.data, null, 2));
    }
}

listGroqModels();
