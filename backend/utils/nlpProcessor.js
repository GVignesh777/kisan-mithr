const natural = require("natural");
const { franc } = require("franc");
const nlp = require("compromise");

const tokenizer = new natural.WordTokenizer();

function processUserInput(text) {

  const languageCode = franc(text);

  let language = "english";

  if (languageCode === "tel") language = "telugu";
  if (languageCode === "hin") language = "hindi";

  const tokens = tokenizer.tokenize(text.toLowerCase());

  let intent = "general_farming";

  if(tokens.includes("weather") || tokens.includes("climate")){
    intent = "weather_query";
  }

  if(tokens.includes("pest") || tokens.includes("insect") || tokens.includes("disease")){
    intent = "crop_disease";
  }

  if(tokens.includes("fertilizer") || tokens.includes("nutrient")){
    intent = "fertilizer_advice";
  }

  // Entity Extraction
  const doc = nlp(text);

  const nouns = doc.nouns().out("array");

  return {
    language,
    intent,
    entities: nouns,
    tokens
  };

}

module.exports = processUserInput;