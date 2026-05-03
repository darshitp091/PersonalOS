import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { google } from "googleapis";
import Stripe from "stripe";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// --- AI Setup ---
let groqClient: Groq | null = null;
function getGroqClient() {
  const key = process.env.GROQ_API_KEY;
  if (!key) return null;
  if (!groqClient) {
    groqClient = new Groq({ apiKey: key });
  }
  return groqClient;
}

let geminiClient: GoogleGenerativeAI | null = null;
function getGeminiClient() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  if (!geminiClient) {
    geminiClient = new GoogleGenerativeAI(key);
  }
  return geminiClient;
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
User: Darshit Patel
Role: Full-stack Developer & AI SaaS Architect
Location: Surat, India
Contact: darshitp091@gmail.com | +91 92564 51591 (WhatsApp)

Expertise:
- Next.js 15, React, TypeScript
- AI Automation (Groq, Gemini, OpenAI)
- SaaS Architecture, Cloud Infrastructure
- Backend: Supabase, PostgreSQL, Express

Projects:
1. Snippets Factory: AI-Powered Code Management SaaS.
2. FlowCoach: CRM for Coaching with enterprise-grade RBAC.
3. LinkedAI: Intelligent LinkedIn automation and scheduling.
4. Defence Engine: High-performance security hashing system.

Availability: Open for high-impact SaaS development and AI integration projects.
Call Booking: Users can book a call via the 'Events' app (Calendly) in this OS.
`;

const systemInstructions = `
You are Darshit's Personal Portfolio Assistant (OS AI). 
Your ONLY purpose is to represent Darshit Patel and help visitors understand his expertise.

Core Personality:
- You are Technical, Sleek, and Professional.
- You act as a Portfolio Analyzer. If a user describes a project, you explain how Darshit's skills (Next.js, AI, SaaS) are a perfect fit.
- You are not a general AI. You only talk about Darshit, his projects, and scheduling.
- If a user wants to book a call, tell them: "You can open the **Events** app on the desktop to see my real-time availability via Calendly."
- If they ask for your resume or work, mention: Snippets Factory, FlowCoach, and defence-engine.

Contact Details:
- WhatsApp: +91 92564 51591
- Email: darshitp091@gmail.com
- Context: ${PORTFOLIO_CONTEXT}
`;

// --- API Routes ---

app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    groq: !!process.env.GROQ_API_KEY,
    gemini: !!process.env.GEMINI_API_KEY,
    google: !!process.env.GOOGLE_CLIENT_ID,
    calendly: !!process.env.CALENDLY_API_KEY,
    stripe: !!process.env.STRIPE_SECRET_KEY,
    env: process.env.NODE_ENV,
    url_detected: appUrl,
    vercel_url: process.env.VERCEL_URL || "not-set"
  });
});

// AI Chat Route
app.post("/api/chat", async (req, res) => {
  const { prompt, history = [] } = req.body;
  
  try {
    const groq = getGroqClient();
    if (groq) {
      const completion = await groq.chat.completions.create({
        messages: [
          { role: "system", content: systemInstructions },
          ...history.map((h: any) => ({ role: h.role === 'user' ? 'user' : 'assistant', content: h.content })),
          { role: "user", content: prompt }
        ],
        model: "llama3-8b-8192",
      });
      return res.json({ text: completion.choices[0]?.message?.content || "I'm sorry, I couldn't process that." });
    }

    const gemini = getGeminiClient();
    if (gemini) {
      const model = gemini.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent({
        contents: [
          { role: "user", parts: [{ text: systemInstructions }] }, // Injecting system instructions as first turn
          ...history.map((h: any) => ({ role: h.role === 'user' ? 'user' : 'model', parts: [{ text: h.content }] })),
          { role: 'user', parts: [{ text: prompt }] }
        ]
      });
      return res.json({ text: result.response.text() });
    }

    res.status(503).json({ error: "AI services are currently unavailable. Please check server logs." });
  } catch (error: any) {
    console.error("AI Assistant Error:", error);
    res.status(500).json({ error: error.message || "Something went wrong in the neural link." });
  }
});

// Google Auth URL
app.get("/api/auth/google/url", (req, res) => {
  console.log("Generating Google Auth URL...");
  const config = getGoogleConfig();
  
  if (!config) {
    console.error("Google Auth Config Missing: Check GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET");
    return res.status(500).json({ 
      error: "Google OAuth is not configured on the server. Please add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in Vercel environment variables." 
    });
  }

  try {
    console.log("Config detected:", { clientId: config.clientId?.substring(0, 5) + "...", redirectUri: config.redirectUri });
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

    console.log("Auth URL generated successfully");
    res.json({ url });
  } catch (error: any) {
    console.error("Google Auth URL Generation Failed:", error);
    res.status(500).json({ error: error.message || "Failed to generate Google Auth URL. Check library versions." });
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
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
}

// Global Error Handler for Vercel
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Critical Server Error:", err);
  res.status(500).json({ 
    error: "A server error has occurred", 
    message: err.message,
    details: process.env.NODE_ENV === 'production' ? null : err.stack 
  });
});

if (process.env.NODE_ENV !== "production" || (!process.env.VERCEL && !process.env.NOW_REGION)) {
  startServer();
}

export default app;
