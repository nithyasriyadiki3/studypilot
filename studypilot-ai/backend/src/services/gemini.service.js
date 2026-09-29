const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

const MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

function getModel(systemInstruction) {
  if (!genAI) {
    throw new Error('GEMINI_API_KEY is not configured on the server.');
  }
  return genAI.getGenerativeModel({ model: MODEL, systemInstruction });
}

/** Generic text generation with an optional system instruction. */
async function generateText(prompt, systemInstruction) {
  const model = getModel(systemInstruction);
  const result = await model.generateContent(prompt);
  return result.response.text();
}

/** Generation that requests strict JSON back, with fence-stripping + parsing. */
async function generateJSON(prompt, systemInstruction) {
  const raw = await generateText(prompt, systemInstruction);
  const cleaned = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch (err) {
    throw new Error('AI returned malformed JSON: ' + err.message);
  }
}

module.exports = { generateText, generateJSON };
