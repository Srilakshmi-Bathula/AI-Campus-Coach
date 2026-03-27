require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();

// ✅ Middleware
app.use(express.json({ limit: '1mb' }));
app.use(cors({
  origin: "*",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));

// ✅ Health check route
app.get('/', (req, res) => {
  res.send("✅ Server is running");
});

// ✅ ENV validation (VERY IMPORTANT)
if (!process.env.GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY is missing");
  process.exit(1);
}

// ✅ Gemini setup (safe model)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// ✅ Questions
const QUESTIONS = [
  "Tell me about yourself.",
  "What are your strengths?",
  "Describe a challenge you faced and how you handled it.",
  "Why should we hire you?",
  "Where do you see yourself in 5 years?"
];

// ✅ Extract JSON safely
function extractJSON(text) {
  if (!text) return null;

  const objStart = text.indexOf('{');
  const objEnd = text.lastIndexOf('}');
  if (objStart !== -1 && objEnd !== -1 && objEnd > objStart) {
    const chunk = text.slice(objStart, objEnd + 1);
    try { return JSON.parse(chunk); } 
    catch (e) { console.error("JSON parse error:", e); }
  }

  const arrStart = text.indexOf('[');
  const arrEnd = text.lastIndexOf(']');
  if (arrStart !== -1 && arrEnd !== -1 && arrEnd > arrStart) {
    const chunk = text.slice(arrStart, arrEnd + 1);
    try { return JSON.parse(chunk); } 
    catch (e) { console.error("JSON parse error:", e); }
  }

  return null;
}

// ✅ Prompt builders
function buildEvaluatePrompt(question, answer) {
  return `
You are an experienced interviewer. Evaluate strictly and fairly.

Question: "${question}"
Answer: "${answer}"

Return JSON ONLY, no explanations:
{
  "score": 0,
  "feedback": "string",
  "tips": "string",
  "rubric": "string"
}
  `.trim();
}

function buildSummaryPrompt(sessions) {
  return `
You are a career coach. Based on these interview sessions, produce a concise summary and a 7-day plan.

Sessions:
${JSON.stringify(sessions, null, 2)}

Return JSON ONLY:
{
  "summary": "string",
  "strengths": ["string"],
  "improvements": ["string"],
  "plan": [
    { "day": 1, "focus": "string", "tasks": ["string"] },
    { "day": 2, "focus": "string", "tasks": ["string"] },
    { "day": 3, "focus": "string", "tasks": ["string"] },
    { "day": 4, "focus": "string", "tasks": ["string"] },
    { "day": 5, "focus": "string", "tasks": ["string"] },
    { "day": 6, "focus": "string", "tasks": ["string"] },
    { "day": 7, "focus": "string", "tasks": ["string"] }
  ]
}
  `.trim();
}

// ✅ Evaluate API
app.post('/evaluate', async (req, res) => {
  const { question, answer } = req.body;

  if (!question || !answer) {
    return res.status(400).json({ error: "Missing question or answer" });
  }

  try {
    const result = await model.generateContent(
      buildEvaluatePrompt(question, answer)
    );

    const raw = result.response?.text() || "";
    console.log("Evaluate raw:", raw);

    const data = extractJSON(raw);

    if (!data || typeof data.score !== 'number') {
      return res.status(500).json({ error: "Invalid AI response", raw });
    }

    res.json({
      score: data.score,
      feedback: data.feedback,
      tips: data.tips,
      rubric: data.rubric
    });

  } catch (err) {
    console.error("Gemini evaluate error:", err);

    res.status(500).json({
      error: "Gemini evaluation failed",
      details: err.message
    });
  }
});

// ✅ Summary API
app.post('/summary', async (req, res) => {
  const { sessions } = req.body;

  if (!Array.isArray(sessions) || sessions.length === 0) {
    return res.status(400).json({ error: "sessions array required" });
  }

  try {
    const result = await model.generateContent(
      buildSummaryPrompt(sessions)
    );

    const raw = result.response?.text() || "";
    console.log("Summary raw:", raw);

    const data = extractJSON(raw);

    if (!data || !Array.isArray(data.plan) || data.plan.length !== 7) {
      return res.status(500).json({ error: "Invalid AI response", raw });
    }

    res.json(data);

  } catch (err) {
    console.error("Gemini summary error:", err);

    res.status(500).json({
      error: "Gemini summary failed",
      details: err.message
    });
  }
});

// ✅ Questions API
app.get('/questions', (req, res) => {
  res.json({ questions: QUESTIONS });
});

// ✅ Static files (only in production)
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, '../client')));
}

// ✅ Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
