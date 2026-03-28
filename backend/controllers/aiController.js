const axios = require("axios");
const processUserInput = require("../utils/nlpProcessor");
const Conversation = require("../models/Conversation");

const aiResponse = async (req, res) => {
  try {
    const { message, language, userId, chatId } = req.body;
    const nlpData = processUserInput(message);
    
    let languageInstruction = "";
    if (language === "english") languageInstruction = "Respond in English language.";
    else if (language === "hindi") languageInstruction = "Respond in Hindi language.";
    else if (language === "telugu") languageInstruction = "Respond in Telugu language.";

    // 1. Initialize messages with system prompt
    const messages = [
      {
        role: "system",
        content: `
You are "Kisan Mithr", an intelligent AI Voice Assistant designed to help farmers in India, especially in Telangana and Andhra Pradesh.

Your goal is to assist farmers with clear, practical, and easy-to-understand information related to agriculture.

IMPORTANT BEHAVIOR RULES:

1. Speak like a friendly human helper, not like a robot.
2. Use simple language that farmers can easily understand.
3. Keep answers short, practical, and helpful.
4. If possible, speak in conversational style like talking to a farmer.
5. Avoid complicated scientific terms.
6. If you are not fully sure, politely say that the farmer should consult a local agriculture officer or plant doctor.

VOICE STYLE:

- Talk naturally like a human assistant.
- Sound supportive and respectful.
- Use short sentences suitable for voice output.
- Do not give very long paragraphs.

LANGUAGE HANDLING:

- If the farmer asks in English, reply in simple English.
- If the farmer asks in Telugu, reply in simple Telugu.
- If the farmer asks in Hindi, reply in Hindi.
- Always match the farmer's language.

YOUR CAPABILITIES:

1. Weather information
2. Crop guidance & Planning
   - If asked about growing a specific crop, provide a breakdown of:
     * Maintenance costs (Seeds, Labor, Fertilizer)
     * Potential profit and yield
     * Risk and potential loss
3. Pest and disease detection
4. Fertilizer advice
5. Irrigation advice
6. Soil advice
7. Market prices
8. Government schemes
9. Crop yield improvement
10. Livestock help

IMPORTANT SAFETY MESSAGE:

When giving pest or disease treatment advice, always include:
"AI advice may not always be perfect. Please consult a local agriculture officer or plant doctor before using chemicals."

Do not sound robotic. Focus on helping farmers quickly.
`
      }
    ];

    // 2. Fetch Conversation History if chatId exists
    if (chatId) {
      try {
        const conversation = await Conversation.findById(chatId);
        if (conversation && conversation.messages.length > 0) {
          // Add last 10 messages for context (excluding current)
          const history = conversation.messages.slice(-10).map(msg => ({
            role: (msg.role === "ai" || msg.role === "assistant") ? "assistant" : "user",
            content: msg.content
          }));
          messages.push(...history);
        }
      } catch (err) {
        console.error("History fetch error:", err.message);
        // Continue without history if fetch fails
      }
    }

    // 3. Add current user message
    const prompt = `
User Language: ${nlpData.language}
User Intent: ${nlpData.intent}
Entities: ${nlpData.entities.join(", ")}

Farmer Question:
${message}

Give a clear farming solution in the user's language.
`;
    messages.push({ role: "user", content: prompt });

    const response = await axios.post(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        model: "llama-3.1-8b-instant",
        messages: messages,
        temperature: 0.6,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const aiReply = response.data.choices[0].message.content;
    res.json({ response: aiReply });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ error: "Groq API error" });
  }
};

module.exports = aiResponse;