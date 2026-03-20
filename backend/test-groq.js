const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

async function testGroqVision() {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
        console.error("GROQ_API_KEY not found in .env");
        return;
    }

    // A tiny 1x1 black pixel GIF in base64
    const base64Image = "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
    const imageUrl = `data:image/gif;base64,${base64Image}`;

    try {
        const response = await axios.post(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                model: "meta-llama/llama-4-scout-17b-16e-instruct",
                messages: [
                    {
                        role: "user",
                        content: [
                            { type: "text", text: "What is in this image?" },
                            {
                                type: "image_url",
                                image_url: {
                                    url: imageUrl
                                }
                            }
                        ]
                    }
                ],
                temperature: 0.1,
            },
            {
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                },
            }
        );

        console.log("Response status:", response.status);
        console.log("Response data:", JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error("Error status:", error.response?.status);
        if (error.response?.data) {
            console.log("Error data:", JSON.stringify(error.response.data, null, 2));
        } else {
            console.error("Error message:", error.message);
        }
    }
}

testGroqVision();
