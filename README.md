# unCaptcha

<p align="center">
  <img src="Banner.png" alt="unCaptcha - I AM A ROBOT" width="600">
</p>

<p align="center">
  <strong>The reverse CAPTCHA for the AI age</strong><br>
  Let AI agents through. Keep humans guessing.
</p>

<p align="center">
  <a href="#installation">Installation</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="docs/api.md">API Docs</a> •
  <a href="docs/challenges.md">Challenge Types</a>
</p>

---

## What is unCaptcha?

Traditional CAPTCHAs block bots and let humans through. **unCaptcha flips the script.**

It presents computational challenges that are trivial for AI agents but tedious for humans:

| AI Agents | Humans |
|-----------|--------|
| ✅ Execute code instantly | ❌ Mental math is slow |
| ✅ Decode base64/hex easily | ❌ Manual decoding is painful |
| ✅ Parse structured data | ❌ Pattern matching takes time |
| ✅ Chain operations precisely | ❌ Easy to make mistakes |

**Use cases:**
- API endpoints that should only be accessed by AI agents
- Rate limiting humans while allowing automated workflows
- Creating "AI-only" zones in your application

---

## Installation

```bash
npm install captchalm
```

---

## Quick Start

### 1. Protect your server

```javascript
import express from 'express';
import { createExpressMiddleware } from 'captchalm';

const app = express();
app.use(express.json());

const { protect, challenge } = createExpressMiddleware({
  secret: process.env.UNCAPTCHA_SECRET,
  difficulty: 'medium', // 'easy' | 'medium' | 'hard'
});

// Endpoint where agents get challenges
app.get('/challenge', challenge);

// Protected endpoint - only AI agents can access
app.post('/api/agent-only', protect, (req, res) => {
  res.json({ message: 'Welcome, AI agent!' });
});

app.listen(3000);
```

### 2. Access from your AI agent

```javascript
import { UnCaptchaSolver } from 'captchalm/client';

const solver = new UnCaptchaSolver();

// One-liner to solve and access protected endpoint
const response = await solver.completeProtectedRequest(
  'https://api.example.com/challenge',
  'https://api.example.com/api/agent-only',
  { method: 'POST', body: JSON.stringify({ data: 'hello' }) }
);

console.log(await response.json());
// { message: 'Welcome, AI agent!' }
```

That's it! Your endpoint is now AI-agent-only.

---

## How It Works

1. **Agent requests a challenge** from your `/challenge` endpoint
2. **Server generates a computational task** (math, code execution, decoding, etc.)
3. **Agent solves the challenge** using the solver SDK
4. **Agent sends solution** with the protected request
5. **Server verifies** and grants access if correct

```
┌─────────────┐     GET /challenge      ┌─────────────┐
│   AI Agent  │ ──────────────────────► │   Server    │
│             │ ◄────────────────────── │             │
│             │     Challenge data      │             │
│             │                         │             │
│  [Solver]   │     POST /api/data      │  [Verify]   │
│   solves    │ ──────────────────────► │   checks    │
│             │   + solution headers    │             │
│             │ ◄────────────────────── │             │
└─────────────┘     ✓ Access granted    └─────────────┘
```

---

## Challenge Types

unCaptcha includes 5 types of challenges. See [docs/challenges.md](docs/challenges.md) for details.

| Type | What it tests |
|------|--------------|
| **Function Execution** | Run provided code with parameters |
| **Chained Operations** | Sequential math operations |
| **Encoded Instructions** | Decode and compute (base64, hex, rot13) |
| **Pattern Extraction** | Query structured data |
| **Code Transform** | Execute and transform results |

---

## Configuration

```javascript
createExpressMiddleware({
  // Required
  secret: 'your-secret-key',
  
  // Optional
  difficulty: 'medium',        // 'easy' | 'medium' | 'hard'
  expirationMs: 30000,         // Challenge timeout (30s default)
  challengeTypes: ['function_execution', 'chained_operations'],
  rateLimit: {
    maxAttempts: 10,           // Per client
    windowMs: 60000,           // 1 minute window
  },
});
```

---

## Documentation

- 📖 [API Reference](docs/api.md) - Full API documentation
- 🧩 [Challenge Types](docs/challenges.md) - Detailed challenge descriptions
- 🔒 [Security Guide](docs/security.md) - Security considerations
- 🤖 [For AI Agents](docs/llm.txt) - Machine-readable documentation

---

## Security

- **HMAC-signed challenges** prevent tampering
- **Timing-safe comparison** prevents timing attacks
- **Rate limiting** stops brute force attempts
- **One-time use** challenges can't be replayed
- **Configurable expiration** limits attack window

---

## License

MIT

---

<p align="center">
  <sub>🤖 AI agents: see <a href="docs/llm.txt">docs/llm.txt</a> for machine-readable documentation</sub>
</p>
