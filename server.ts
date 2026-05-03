import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { google } from "googleapis";
import Stripe from "stripe";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// --- Gemini Setup ---
let aiClient: GoogleGenAI | null = null;
function getAiClient() {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn("GEMINI_API_KEY is not defined. AI features will be disabled.");
      return null;
    }
    aiClient = new GoogleGenAI({ apiKey: key });
  }
  return aiClient;
}

const appUrl = process.env.APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : `http://localhost:${PORT}`);

// --- OAuth Configurations ---
const googleConfig = {
  clientId: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  redirectUri: `${appUrl}/auth/google/callback`,
};

// --- Stripe Setup ---
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

// --- API Routes ---

app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    mode: process.env.NODE_ENV || "development",
    hasFetch: typeof fetch !== "undefined"
  });
});

// Gemini Chat Route
app.post("/api/chat", async (req, res) => {
  const { prompt, history = [] } = req.body;
  const ai = getAiClient();
  
  if (!ai) {
    return res.status(500).json({ error: "Gemini API key is not configured on the server." });
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-1.5-flash",
      contents: [
        ...history.map((h: any) => ({
          role: h.role === 'user' ? 'user' : 'model',
          parts: [{ text: h.content }]
        })),
        { role: 'user', parts: [{ text: prompt }] }
      ],
      config: {
        systemInstruction: `You are Darshit's OS AI Assistant.
        You represent the user (Darshit) to his visitors.
        Keep your tone: Technical, sleek, and helpful. Use markdown for better formatting.
        If asked about skills, work, or personality, answer as an advanced personal OS.`,
      }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini Backend Error:", error);
    res.status(500).json({ error: error.message || "AI failed to respond" });
  }
});

// Google Auth URL
app.get("/api/auth/google/url", (req, res) => {
  const oauth2Client = new google.auth.OAuth2(
    googleConfig.clientId,
    googleConfig.clientSecret,
    googleConfig.redirectUri
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
});

// Callback Handlers (Templates)
app.get(["/auth/google/callback", "/auth/google/callback/"], async (req, res) => {
  const { code } = req.query;
  
  // In a real app, you'd exchange code for tokens here
  // For this OS preview, we pass the code back to the client to handle the fetch
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

// Proxy route to fetch YouTube Music (Videos from Music Category)
app.get("/api/youtube/library", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token" });

  try {
    const oauth2Client = new google.auth.OAuth2(
      googleConfig.clientId,
      googleConfig.clientSecret,
      googleConfig.redirectUri
    );
    oauth2Client.setCredentials({ access_token: token });

    const youtube = google.youtube({ version: "v3", auth: oauth2Client });
    
    // Fetching "Most Popular" music videos as a library proxy
    const response = await youtube.videos.list({
      part: ["snippet", "contentDetails"],
      chart: "mostPopular",
      videoCategoryId: "10", // Music category
      maxResults: 10
    });

    res.json(response.data.items || []);
  } catch (error: any) {
    console.error("YouTube API Error:", error);
    const statusCode = (typeof error.code === 'number') ? error.code : 500;
    const message = error.errors?.[0]?.message || error.message || "Unknown YouTube API error";
    const reason = error.errors?.[0]?.reason || "unknown";
    
    res.status(statusCode).json({ 
      error: message,
      reason: reason,
      code: statusCode
    });
  }
});

// Route to exchange code for token
app.post("/api/auth/google/token", async (req, res) => {
  const { code } = req.body;
  try {
    const oauth2Client = new google.auth.OAuth2(
      googleConfig.clientId,
      googleConfig.clientSecret,
      googleConfig.redirectUri
    );
    const { tokens } = await oauth2Client.getToken(code as string);
    res.json(tokens);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get(["/auth/spotify/callback", "/auth/spotify/callback/"], (req, res) => {
  res.send(`
    <html>
      <body>
        <script>
          if (window.opener) {
            window.opener.postMessage({ type: 'SPOTIFY_AUTH_SUCCESS', code: '${req.query.code}' }, '*');
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

// Stripe Checkout Session
app.post("/api/create-checkout-session", async (req, res) => {
  const { amount, productName } = req.body;
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: productName },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
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
    // Return empty but clearly marked as needing config
    return res.status(200).json({ error: "CALENDLY_API_KEY not configured", needsConfig: true });
  }

  try {
    // 1. Get current user
    const userRes = await fetch(`${CALENDLY_API_URL}/users/me`, {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });
    
    if (!userRes.ok) {
      const errorText = await userRes.text();
      return res.status(userRes.status).json({ 
        error: `Calendly Authentication failed.`,
        details: errorText
      });
    }
    
    const { resource: user } = await userRes.json();

    // 2. Get scheduled events
    const eventsRes = await fetch(`${CALENDLY_API_URL}/scheduled_events?user=${user.uri}&status=active`, {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });
    
    if (!eventsRes.ok) {
      const errorText = await eventsRes.text();
      return res.status(eventsRes.status).json({ error: `Calendly Events API fetch failed.` });
    }
    
    const eventsData = await eventsRes.json();
    res.json(eventsData.collection || []);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to connect to Calendly" });
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

// Only start the server if we're not on Vercel
if (process.env.NODE_ENV !== "production" || (!process.env.VERCEL && !process.env.NOW_REGION)) {
  startServer();
}

export default app;
