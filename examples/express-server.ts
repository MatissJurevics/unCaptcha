/**
 * Express server example for CaptchaLM
 */

import express from 'express';
import { createExpressMiddleware } from '../src';

const app = express();
app.use(express.json());

// Create CaptchaLM middleware
const { protect, challenge, generator, verifier } = createExpressMiddleware({
    secret: process.env.UNCAPTCHA_SECRET || 'your-secret-key-change-in-production',
    difficulty: 'medium',
    expirationMs: 30000, // 30 seconds
    rateLimit: {
        maxAttempts: 10,
        windowMs: 60000, // 1 minute
    },
});

// Public endpoint - no protection
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to the CaptchaLM demo API',
        endpoints: {
            challenge: 'GET /_captchalm/challenge',
            protected: 'POST /api/data (requires CaptchaLM)',
            public: 'GET /api/public',
        },
    });
});

// Challenge endpoint - agents request challenges here
app.get('/_captchalm/challenge', challenge);

// Public endpoint - no protection
app.get('/api/public', (req, res) => {
    res.json({
        message: 'This endpoint is public',
        data: [1, 2, 3, 4, 5],
    });
});

// Protected endpoint - requires valid challenge solution
app.post('/api/data', protect, (req, res) => {
    res.json({
        success: true,
        message: 'Access granted! You solved the challenge.',
        yourData: req.body,
    });
});

// Stats endpoint - for monitoring
app.get('/api/stats', (req, res) => {
    res.json({
        stats: verifier.getStats(),
    });
});

// Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🔐 CaptchaLM demo server running on http://localhost:${PORT}`);
    console.log('');
    console.log('Endpoints:');
    console.log(`  GET  /                       - API info`);
    console.log(`  GET  /_captchalm/challenge   - Get a challenge`);
    console.log(`  GET  /api/public             - Public endpoint`);
    console.log(`  POST /api/data               - Protected endpoint (requires challenge)`);
    console.log(`  GET  /api/stats              - Server stats`);
});
