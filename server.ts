import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import http from "node:http";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Security: Rate limiting configuration
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX_REQUESTS = 100; // Max requests per window

function rateLimitMiddleware(req: express.Request, res: express.Response, next: express.NextFunction) {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  
  let record = rateLimitStore.get(ip);
  
  if (!record || now > record.resetTime) {
    record = { count: 0, resetTime: now + RATE_LIMIT_WINDOW };
    rateLimitStore.set(ip, record);
  }
  
  record.count++;
  
  if (record.count > RATE_LIMIT_MAX_REQUESTS) {
    res.status(429).json({ 
      error: 'Too many requests. Please try again later.',
      retryAfter: Math.ceil((record.resetTime - now) / 1000)
    });
    return;
  }
  
  // Add rate limit headers
  res.setHeader('X-RateLimit-Limit', RATE_LIMIT_MAX_REQUESTS.toString());
  res.setHeader('X-RateLimit-Remaining', (RATE_LIMIT_MAX_REQUESTS - record.count).toString());
  res.setHeader('X-RateLimit-Reset', record.resetTime.toString());
  
  next();
}

async function startServer() {
  const app = express();
  const PORT = 3000;
  const server = http.createServer(app);

  // ==============================================================================
  // SECURITY: CORS Configuration
  // ==============================================================================
  // Restrict allowed origins - update this for production
  const ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://crsaesuyqpfvzegijqww.supabase.co'
  ];
  
  const corsOptions = {
    origin: (origin: string | undefined, callback: (err: Error | null, allowed?: boolean) => void) => {
      // Allow requests with no origin (mobile apps, curl, etc.) in development
      // In production, set origin to your actual domain
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true);
      } else {
        console.log(`CORS blocked: ${origin}`);
        callback(new Error('Not allowed by CORS'), false);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  };

  // Apply security middleware
  app.use(cors(corsOptions));
  app.use(rateLimitMiddleware); // Rate limiting
  app.use(express.json({ limit: '10kb' })); // Limit request body size

  // ==============================================================================
  // SECURITY: HTTP Security Headers
  // ==============================================================================
  app.use((req, res, next) => {
    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'DENY');
    
    // Prevent XSS attacks
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // HSTS (HTTPS only) - enable in production
    // res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    
    // Content Security Policy
    res.setHeader(
      'Content-Security-Policy',
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
      "style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' data: https:; " +
      "font-src 'self' data:; " +
      "connect-src 'self' https://crsaesuyqpfvzegijqww.supabase.co https://*.supabase.co https://generativelanguage.googleapis.com; " +
      "frame-ancestors 'none';"
    );
    
    // Referrer Policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Permissions Policy
    res.setHeader(
      'Permissions-Policy',
      'camera=(), microphone=(), geolocation=()'
    );
    
    next();
  });

  // Gemini Setup
  const getAi = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    return new GoogleGenAI({ apiKey });
  };

  // API Routes
  app.post("/api/ai/analyze-application", async (req, res) => {
    try {
      const { application } = req.body;
      const ai = getAi();
      
      const prompt = `Analyze this mentorship application for seriousness and quality. 
      
      Applicant: ${application.user_name}
      Mentor Type requested: ${application.mentor_type}
      Goals: ${application.goals}
      Seriousness Score: ${application.seriousness}/10
      Experience: ${application.experience || 'Not provided'}
      Pillar: ${application.pillar || 'Not provided'}
      
      Provide a seriousness score from 1-10, an executive summary, a recommendation, and list any red flags.
      Output strictly in JSON.`;

      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.NUMBER },
              summary: { type: Type.STRING },
              recommendation: { type: Type.STRING },
              redFlags: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["score", "summary", "recommendation", "redFlags"]
          }
        }
      });

      res.json(JSON.parse(result.text || '{}'));
    } catch (error: any) {
      console.error("AI Analysis Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/ai/generate-brief", async (req, res) => {
    try {
      const { booking, studentContext, purchasedProducts } = req.body;
      const ai = getAi();

      const prompt = `Create a pre-session brief for a mentor.
      
      Student: ${booking.user_name}
      Session Time: ${booking.time} on ${booking.date}
      Base Context: ${studentContext}
      Assets Owned: ${purchasedProducts && purchasedProducts.length > 0 ? purchasedProducts.join(', ') : 'None'}
      
      Focus on suggested topics to cover, how to integrate their owned assets into the strategy, and potential goals for this call. Keep the tone elite and concise.`;

      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt
      });
      res.json({ text: result.text });
    } catch (error: any) {
      console.error("AI Brief Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { history, message } = req.body;
      const ai = getAi();
      
      const contents = [
        ...history.map((h: any) => ({
          role: h.role === 'user' ? 'user' : 'model',
          parts: [{ text: h.text }]
        })),
        { role: 'user', parts: [{ text: message }] }
      ];

      const result = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: contents,
        config: {
          systemInstruction: "You are an elite administrative assistant for Peter Mannarino, a high-level mentor. Your tone is professional, concise, and calm. You help with managing applications, scheduling, and product recommendations."
        }
      });

      res.json({ text: result.text });
    } catch (error: any) {
      console.error("AI Chat Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: {
          server: server,
          clientPort: 443
        },
        allowedHosts: ["all"]
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Security features enabled:`);
    console.log(`  - Rate Limiting: ${RATE_LIMIT_MAX_REQUESTS} requests per 15 min`);
    console.log(`  - CORS: Restrictive origin checking enabled`);
    console.log(`  - Security Headers: CSP, X-Frame-Options, X-XSS-Protection`);
    console.log(`  - Request Body Limit: 10kb`);
  });
}

startServer();