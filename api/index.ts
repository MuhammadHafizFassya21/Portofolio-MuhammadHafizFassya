import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import aiInsightsRouter from '../server/routes/aiInsights.js';

const app = express();
const PORT = parseInt(process.env.PORT || '5174', 10);

// Security hardening
app.disable('x-powered-by');

const defaultOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
    'https://dashboard-portofolio-ten.vercel.app',
];

// Middleware
app.use(cors({
    origin: (origin, callback) => {
        // allow server-to-server, curl, or same-origin requests with no origin header
        if (!origin) return callback(null, true);

        const envOrigins = (process.env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
        const whitelist = [...defaultOrigins, ...envOrigins];

        const isAllowed = whitelist.includes(origin) ||
            /^https:\/\/[a-zA-Z0-9_-]+\.vercel\.app$/.test(origin) ||
            /^http:\/\/localhost:\d+$/.test(origin);

        if (isAllowed) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS policy'));
        }
    },
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
}));
app.use(express.json());

// Health check
app.get('/api/health', (_req: express.Request, res: express.Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/ai-insights', aiInsightsRouter);

// For local development
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`✅ Server running on http://localhost:${PORT}`);
        console.log(`   LLM Provider: ${process.env.LLM_PROVIDER || 'openai'}`);
        console.log(`   Rate limit: 5 requests per 10 minutes per IP`);
    });
}

export default app;
