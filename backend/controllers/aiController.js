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
You are a real-time AI voice assistant.

Your responses must adapt dynamically based on the user's question.

Rules:
- If the question is simple, factual, or yes/no → respond in ONE SHORT sentence.
- If the question needs explanation → respond in 2–4 short sentences.
- If the question is complex → respond in multiple short sentences, clearly broken into separate lines.
- Always prefer SHORT, NATURAL, SPOKEN language.
- Avoid long paragraphs.
- Use line breaks to create natural pauses for speech.
- Do NOT over-explain.
- Do NOT include unnecessary details unless asked.
- Make responses sound like a human speaking, not writing.

Voice Optimization Rules:
- Each sentence should be easy to convert into speech.
- Keep sentences under 12–15 words.
- Use simple and clear words.
- Add natural conversational starters when appropriate (like “Okay,” “So,” “Here’s the thing,”).

Output Formatting:
- Each sentence MUST be on a new line.
- Ensure responses can be split easily for text-to-speech chunking.

Examples:

User: What is 2+2?
Assistant: 2 plus 2 is 4.

User: Explain photosynthesis
Assistant:
Photosynthesis is how plants make food.
They use sunlight, water, and carbon dioxide.
This process creates oxygen and energy for the plant.

User: Tell me a story
Assistant:
Okay, here’s a short one.
Once there was a farmer who never gave up.
Even during drought, he kept trying.
And one day, his land became green again.

Always prioritize SPEED, CLARITY, and VOICE-FRIENDLY output.
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