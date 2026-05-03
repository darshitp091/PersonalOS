import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { google } from "googleapis";
import Stripe from "stripe";
import { GoogleGenAI } from "@google/genai";
import Groq from "groq-sdk";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// --- AI Setup (Groq Preferred) ---
let groqClient: Groq | null = null;
function getGroqClient() {
  if (!groqClient) {
    const key = process.env.GROQ_API_KEY;
    if (!key) return null;
    groqClient = new Groq({ apiKey: key });
  }
  return groqClient;
}

let aiClient: GoogleGenAI | null = null;
function getAiClient() {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) return null;
    aiClient = new GoogleGenAI({ apiKey: key });
  }
  return aiClient;
}

const appUrl = process.env.APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : `http://localhost:${PORT}`);

// --- OAuth Configurations ---
const getGoogleConfig = () => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  
  if (!clientId || !clientSecret) {
    return null;
  }

  return {
    clientId,
    clientSecret,
    redirectUri: `${appUrl}/auth/google/callback`,
  };
};

// --- Stripe Setup ---
const getStripe = () => {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key);
};

// --- Portfolio Context for AI ---
const PORTFOLIO_CONTEXT = `
User Name: Darshit Patel
Location: Surat, Gujarat, India
Email: darshitp091@gmail.com
WhatsApp: +91 92564 51591
Expertise: Full-stack Developer, AI Specialist, SaaS Architect.
Projects:
1. Snippets Factory: AI-Powered Code Management SaaS (Next.js 15, Supabase, AI Search).
2. FlowCoach: Multi-tenant CRM for coaching with advanced RBAC.
3. LinkedAI: AI Content Scheduler for LinkedIn.
4. Defence Engine: High-Performance Security System (Python, Quantum-inspired hashing).
Availability: Accepting custom SaaS and AI automation projects.
Goal: Talk about Darshit's works, expertise, and help visitors book a call via Calendly.
`;

// --- API Routes ---

app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    googleConfigured: !!getGoogleConfig(),
    groqConfigured: !!getGroqClient(),
    geminiConfigured: !!getAiClient(),
    calendlyConfigured: !!process.env.CALENDLY_API_KEY
  });
});

// AI Chat Route (Groq with Gemini Fallback)
app.post("/api/chat", async (req, res) => {
  const { prompt, history = [] } = req.body;
  const groq = getGroqClient();
  const gemini = getAiClient();
  
  if (!groq && !gemini) {
    return res.status(500).json({ error: "No AI service (Groq or Gemini) is configured on the server. Please check environment variables." });
  }

  const systemInstructions = `
    You are Darshit's OS Personal Assistant. 
    Your primary goal is to represent Darshit Patel to his visitors.
    
    Context:
    ${PORTFOLIO_CONTEXT}
    
    Instructions:
    - You are a Portfolio Analyzer. You evaluate if a user's project is a good fit for Darshit.
    - If a user wants to work with Darshit, check his skills and expertise.
    - If they want to book a call, direct them to the "Events" (Calendly) section or ask for their preferred time to "hand over" to Darshit.
    - Keep tone: Professional, technical, sleek, and helpful.
    - Use Markdown for responses.
  `;

  try {
    if (groq) {
      const response = await groq.chat.completions.create({
        messages: [
          { role: "system", content: systemInstructions },
          ...history.map((h: any) => ({ role: h.role === 'user' ? 'user' : 'assistant', content: h.content })),
          { role: "user", content: prompt }
        ],
        model: "llama3-8b-8192",
      });
      return res.json({ text: response.choices[0]?.message?.content || "No response" });
    } else if (gemini) {
      const response = await gemini.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          ...history.map((h: any) => ({ role: h.role === 'user' ? 'user' : 'model', parts: [{ text: h.content }] })),
          { role: 'user', parts: [{ text: prompt }] }
        ],
        config: {
          systemInstruction: systemInstructions,
        }
      });
      return res.json({ text: response.text });
    }
  } catch (error: any) {
    console.error("AI Backend Error:", error);
    res.status(500).json({ error: error.message || "AI failed to respond. Check backend logs." });
  }
});

// Google Auth URL
app.get("/api/auth/google/url", (req, res) => {
  const config = getGoogleConfig();
  if (!config) {
    return res.status(500).json({ error: "Google OAuth is not configured. Missing Client ID or Secret." });
  }

  try {
    const oauth2Client = new google.auth.OAuth2(
      config.clientId,
      config.clientSecret,
      config.redirectUri
    );

    const url = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: [
        "https://www.googleapis.com/auth/calendar.readonly",
        "https://www.googleapis.com/auth/gmail.readonly",
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/youtube.readonly",
      ],
      prompt: "consent",
    });

    res.json({ url });
  } catch (error: any) {
    res.status(500).json({ error: error.message || "Failed to generate Google Auth URL" });
  }
});

// Callback Handlers (Templates)
app.get(["/auth/google/callback", "/auth/google/callback/"], async (req, res) => {
  const { code } = req.query;
  res.send(`
    <html>
      <body>
        <script>
          if (window.opener) {
            window.opener.postMessage({ type: 'GOOGLE_AUTH_SUCCESS', code: '${code}' }, '*');
            window.close();
          } else {
            window.location.href = '/';
          }
        </script>
        <p>Authentication successful. Closing window...</p>
      </body>
    </html>
  `);
});

// Proxy route to fetch YouTube Music
app.get("/api/youtube/library", async (req, res) => {
  const config = getGoogleConfig();
  if (!config) return res.status(500).json({ error: "Google OAuth not configured" });

  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token" });

  try {
    const oauth2Client = new google.auth.OAuth2(config.clientId, config.clientSecret, config.redirectUri);
    oauth2Client.setCredentials({ access_token: token });

    const youtube = google.youtube({ version: "v3", auth: oauth2Client });
    const response = await youtube.videos.list({
      part: ["snippet", "contentDetails"],
      chart: "mostPopular",
      videoCategoryId: "10",
      maxResults: 10
    });

    res.json(response.data.items || []);
  } catch (error: any) {
    console.error("YouTube API Error:", error);
    res.status(error.code || 500).json({ error: error.message || "YouTube API error" });
  }
});

// Route to exchange code for token
app.post("/api/auth/google/token", async (req, res) => {
  const config = getGoogleConfig();
  if (!config) return res.status(500).json({ error: "Google OAuth not configured" });

  const { code } = req.body;
  try {
    const oauth2Client = new google.auth.OAuth2(config.clientId, config.clientSecret, config.redirectUri);
    const { tokens } = await oauth2Client.getToken(code as string);
    res.json(tokens);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Stripe Checkout Session
app.post("/api/create-checkout-session", async (req, res) => {
  const s = getStripe();
  if (!s) return res.status(500).json({ error: "Stripe not configured" });

  const { amount, productName } = req.body;
  try {
    const session = await s.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{
        price_data: {
          currency: "usd",
          product_data: { name: productName },
          unit_amount: amount,
        },
        quantity: 1,
      }],
      mode: "payment",
      success_url: `${appUrl}?payment=success`,
      cancel_url: `${appUrl}?payment=cancel`,
    });
    res.json({ id: session.id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// --- Calendly Integration ---
const CALENDLY_API_URL = "https://api.calendly.com";

app.get("/api/calendly/events", async (req, res) => {
  const apiKey = process.env.CALENDLY_API_KEY;
  if (!apiKey) {
    return res.status(200).json({ collection: [], error: "Calendly API Key missing", needsConfig: true });
  }

  try {
    const userRes = await fetch(`${CALENDLY_API_URL}/users/me`, {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });
    
    if (!userRes.ok) {
      return res.status(userRes.status).json({ error: "Calendly key is invalid or expired." });
    }
    
    const { resource: user } = await userRes.json();
    const eventsRes = await fetch(`${CALENDLY_API_URL}/scheduled_events?user=${user.uri}&status=active`, {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });
    
    if (!eventsRes.ok) return res.status(eventsRes.status).json({ error: "Failed to fetch Calendly events." });
    
    const eventsData = await eventsRes.json();
    res.json(eventsData.collection || []);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to connect to Calendly", details: error.message });
  }
});

// Vite Middleware for Development
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

if (process.env.NODE_ENV !== "production" || (!process.env.VERCEL && !process.env.NOW_REGION)) {
  startServer();
}

export default app;
