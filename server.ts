import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Increase JSON payload limit to accommodate photo questions for Snap & Solve
app.use(express.json({ limit: '15mb' }));

// Lazy Google Gen AI client
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({ apiKey: key });
  }
  return genAIClient;
}

// 1. AI Health / Status Check
app.get('/api/ai/status', (req, res) => {
  const key = process.env.GEMINI_API_KEY;
  res.json({
    configured: Boolean(key && key.trim().length > 5),
    model: 'gemini-3.8-flash',
  });
});

// 2. Chat & Study Copilot Endpoint
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { messages, context, mode, subject, topic } = req.body;

    const ai = getGenAI();
    if (!ai) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY is not configured on the server.',
        isDemoFallback: true,
      });
    }

    // Build system prompt with student context
    let systemInstruction = `You are FOCUS AI, a dedicated academic study copilot and empathetic tutor.
You help students understand complex concepts, solve STEM and humanities problems with rigorous reasoning, and organize their study plans.
Always adopt a learning-first tutor posture: explain concepts clearly, provide mathematical derivations or formula references where needed, identify common student pitfalls, and suggest practical study actions.
Format equations with standard LaTeX ($...$ or $$...$$) and use bold text, clean lists, and markdown tables for optimal scannability.`;

    if (context?.student) {
      systemInstruction += `\n\nStudent Profile:
Name: ${context.student.name || 'Student'}
Grade: ${context.student.grade || 'High School / College'}
Target Daily Hours: ${context.student.dailyGoalHours || 3} hours/day
Upcoming Exams: ${(context.upcomingExams || []).map((e: any) => `${e.subject} in ${e.daysRemaining} days`).join(', ') || 'None scheduled'}
Due Revisions: ${(context.dueRevisions || []).map((r: any) => `${r.subject}: ${r.topic}`).join(', ') || 'All up to date'}`;
    }

    if (mode === 'explain-simpler') {
      systemInstruction += `\n\nUser explicitly requested: Explain this concept at a foundational, intuitive level using relatable analogies, simplified terminology, and clear steps.`;
    } else if (mode === 'practice') {
      systemInstruction += `\n\nUser requested: Provide 3 high-yield practice questions with answer choices and detailed explanations.`;
    } else if (mode === 'test-me') {
      systemInstruction += `\n\nUser requested Test Mode: Ask exactly one diagnostic question to test their understanding. Do not reveal the answer yet; prompt them to reply with their solution.`;
    }

    // Prepare contents array for gemini-3.8-flash
    const contents = (messages || []).map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    // If no previous messages, supply the user prompt
    if (contents.length === 0) {
      contents.push({
        role: 'user',
        parts: [{ text: 'Hello FOCUS AI, help me organize my study.' }],
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
        temperature: 0.6,
      },
    });

    const outputText = response.text || '';

    // Suggest context-aware actionable quick buttons
    const suggestedActions = [
      { type: 'explain-simpler', label: 'Explain Simpler' },
      { type: 'give-example', label: 'Give an Example' },
      { type: 'test-me', label: 'Test Me on This' },
      {
        type: 'add-revision',
        label: 'Add to Revision',
        payload: { topic: topic || subject || 'Key Concept', subject: subject || 'General' },
      },
      {
        type: 'quick-focus',
        label: 'Start 30-min Quick Focus',
        payload: { duration: 30, topic: topic || subject || 'Concept Study', subject: subject || 'General' },
      },
    ];

    res.json({
      content: outputText,
      suggestedActions,
      isDemo: false,
    });
  } catch (error: any) {
    console.error('Gemini Chat Error:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate response',
      isDemoFallback: true,
    });
  }
});

// 3. Snap & Solve Image Question Endpoint
app.post('/api/ai/snap-solve', async (req, res) => {
  try {
    const { imageBase64, mimeType, userPrompt, context } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Image data is required.' });
    }

    const ai = getGenAI();
    if (!ai) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY is not configured on the server.',
        isDemoFallback: true,
      });
    }

    // Strip base64 prefix if included (e.g. data:image/png;base64,...)
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-z0-9+.-]+;base64,/i, '');
    const cleanMime = mimeType || 'image/jpeg';

    const promptText = `You are the Snap & Solve engine for FOCUS.
Analyze this image containing an academic question or textbook problem.
Extract the question text, identify the subject and topic, and provide a comprehensive, step-by-step educational solution.

Return your response strictly as a JSON object adhering to this schema:
{
  "detectedQuestion": "Exact extracted text of the question",
  "subject": "Physics | Mathematics | Chemistry | Computer Science | Literature | Biology",
  "topic": "Specific chapter or topic name",
  "confidence": 0.95,
  "solution": {
    "detectedQuestion": "Exact extracted text",
    "subject": "Subject name",
    "topic": "Topic name",
    "understanding": "Clear explanation of what the question is asking and core principles involved",
    "given": ["List of given values, constants, and parameters with units"],
    "formulas": ["Relevant governing formulas and laws"],
    "steps": [
      {
        "stepNumber": 1,
        "title": "Step title",
        "explanation": "Detailed explanation of this step",
        "mathExpression": "Key equation or substitution in this step"
      }
    ],
    "finalAnswer": "Clearly stated final numerical or conceptual answer with units",
    "commonPitfalls": ["1-2 common exam mistakes or sign errors to avoid"],
    "alternativeMethod": "Brief alternative approach or quick verification check"
  }
}
Additional user note or hint: ${userPrompt || 'None'}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType: cleanMime,
                data: cleanBase64,
              },
            },
            {
              text: promptText,
            },
          ],
        },
      ],
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const responseText = response.text || '{}';
    let parsedData;
    try {
      parsedData = JSON.parse(responseText);
    } catch {
      // Fallback JSON regex extraction if text wrapper exists
      const match = responseText.match(/\{[\s\S]*\}/);
      if (match) {
        parsedData = JSON.parse(match[0]);
      } else {
        throw new Error('Could not parse structured JSON from AI output');
      }
    }

    res.json({
      detectedQuestion: parsedData.detectedQuestion || 'Extracted Question',
      subject: parsedData.subject || 'General STEM',
      topic: parsedData.topic || 'Problem Solving',
      confidence: parsedData.confidence || 0.95,
      solution: parsedData.solution,
      isDemo: false,
    });
  } catch (error: any) {
    console.error('Snap & Solve Gemini Error:', error);
    res.status(500).json({
      error: error.message || 'Failed to analyze question image',
      isDemoFallback: true,
    });
  }
});

// 4. Practice Mode Generator Endpoint
app.post('/api/ai/practice', async (req, res) => {
  try {
    const { subject, topic, difficulty = 'Medium', count = 5 } = req.body;
    const ai = getGenAI();
    if (!ai) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY is not configured on the server.',
        isDemoFallback: true,
      });
    }

    const prompt = `You are the Practice Generator for FOCUS.
Generate an academic practice set with exactly ${count} multiple choice questions.
Subject: ${subject || 'General'}
Topic: ${topic || 'Key Concepts'}
Target Difficulty: ${difficulty}

For every question, adhere strictly to a learning-first structure:
1. "question": clear question statement with LaTeX math where appropriate ($...$ or $$...$$).
2. "conceptTag": specific concept tested (e.g. "Gauss's Law", "King's Property", "Lens Maker Formula").
3. "options": exactly 4 distinct answer choices.
4. "correctAnswer": exact matching string of the correct option.
5. "explanation": standard step-by-step solution.
6. "why": deep conceptual reasoning explaining the physical/mathematical mechanism.
7. "remember": concise, high-yield memory cue or mnemonic formula.
8. "commonMistake": likely student misconception to steer away from.

Output strictly as a JSON object adhering to:
{
  "subject": "${subject || 'General'}",
  "topic": "${topic || 'Key Concepts'}",
  "difficulty": "${difficulty}",
  "questions": [
    {
      "id": "q1",
      "conceptTag": "string",
      "question": "string",
      "options": ["string", "string", "string", "string"],
      "correctAnswer": "string",
      "explanation": "string",
      "why": "string",
      "remember": "string",
      "commonMistake": "string"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: 'application/json',
        temperature: 0.5,
      },
    });

    const responseText = response.text || '{}';
    let parsedData: any = {};
    try {
      parsedData = JSON.parse(responseText);
    } catch {
      const match = responseText.match(/\{[\s\S]*\}/);
      if (match) parsedData = JSON.parse(match[0]);
    }

    res.json({
      subject: parsedData.subject || subject,
      topic: parsedData.topic || topic,
      difficulty: parsedData.difficulty || difficulty,
      questions: parsedData.questions || [],
      isDemo: false,
    });
  } catch (error: any) {
    console.error('Practice Generation Error:', error);
    res.status(500).json({
      error: error.message || 'Failed to generate practice questions',
      isDemoFallback: true,
    });
  }
});

// Vite & Static Asset Handling
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0', port: PORT },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FOCUS Application & AI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
