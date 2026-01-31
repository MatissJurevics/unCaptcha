# unCaptcha

**AI-Only Access Control** - A reverse CAPTCHA library that allows AI agents while blocking humans.

## Overview

Traditional CAPTCHAs block bots and allow humans. **unCaptcha** flips this paradigm by presenting computational challenges that:

- ✅ AI agents solve easily (code execution, pattern matching, encoded instructions)
- ❌ Humans struggle with (mental code execution, complex calculations, decoding)

## Installation

```bash
npm install uncaptcha
```

## Quick Start

### Server-Side (Express)

```typescript
import express from 'express';
import { createExpressMiddleware } from 'uncaptcha';

const app = express();
app.use(express.json());

// Create middleware
const { protect, challenge } = createExpressMiddleware({
  secret: process.env.UNCAPTCHA_SECRET!,
  difficulty: 'medium',
  expirationMs: 30000, // 30 seconds
});

// Challenge endpoint - agents request challenges here
app.get('/_uncaptcha/challenge', challenge);

// Protected route - requires valid challenge solution
app.post('/api/protected', protect, (req, res) => {
  res.json({ success: true, message: 'Access granted!' });
});

app.listen(3000);
```

### Server-Side (Standalone)

```typescript
import { UnCaptcha } from 'uncaptcha';

const uncaptcha = new UnCaptcha({
  secret: process.env.UNCAPTCHA_SECRET!,
  difficulty: 'medium',
});

// Generate a challenge
const { challenge, expectedAnswer } = uncaptcha.generate();

// Verify a solution
const result = uncaptcha.verify(challenge, userSolution);

if (result.valid) {
  console.log('Access granted!');
} else {
  console.log('Access denied:', result.error);
}
```

### Client-Side (AI Agent)

```typescript
import { UnCaptchaSolver } from 'uncaptcha/client';

const solver = new UnCaptchaSolver();

// Option 1: Solve a challenge you already have
const result = solver.solve(challenge);
console.log('Solution:', result.solution);

// Option 2: Fetch and solve, then make protected request
const response = await solver.completeProtectedRequest(
  'https://api.example.com/_uncaptcha/challenge',
  'https://api.example.com/api/protected',
  { method: 'POST', body: JSON.stringify({ data: 'my data' }) }
);
```

## Challenge Types

### 1. Function Execution

Present a function definition and parameters, expect the computed output.

```javascript
{
  type: 'function_execution',
  functionName: 'fibonacci',
  functionCode: 'function fibonacci(n) { ... }',
  parameters: [12],
  responseEncoding: 'base64'
}
// Agent must execute the function and return base64-encoded result
```

### 2. Chained Operations

Sequential arithmetic operations that must be computed in order.

```javascript
{
  type: 'chained_operations',
  initialValue: 42,
  operations: [
    { operation: 'multiply', value: 3 },
    { operation: 'add', value: 17 },
    { operation: 'modulo', value: 50 }
  ],
  responseEncoding: 'plain'
}
// Answer: 42 * 3 = 126, 126 + 17 = 143, 143 % 50 = 43
```

### 3. Encoded Instructions

Instructions encoded in base64/hex/rot13 that must be decoded and executed.

```javascript
{
  type: 'encoded_instruction',
  instruction: 'Q2FsY3VsYXRlOiA0NSArIDg3', // base64: "Calculate: 45 + 87"
  instructionEncoding: 'base64',
  responseEncoding: 'hex'
}
// Agent must decode, calculate, and encode response
```

### 4. Pattern Extraction

Query structured data using simple expressions.

```javascript
{
  type: 'pattern_extraction',
  data: {
    items: [
      { id: 1, value: 25 },
      { id: 2, value: 50 },
      { id: 3, value: 75 }
    ]
  },
  query: 'sum(items[*].value)',
  responseEncoding: 'plain'
}
// Answer: 150
```

### 5. Code Transform

Execute code snippets and optionally transform the result.

```javascript
{
  type: 'code_transform',
  code: 'const x = 15; const y = 27; return x * y;',
  transform: 'execute',
  responseEncoding: 'base64'
}
// Answer: base64("405")
```

## Configuration

```typescript
interface UnCaptchaConfig {
  // Required: Secret key for HMAC signing
  secret: string;
  
  // Challenge difficulty (default: 'medium')
  difficulty?: 'easy' | 'medium' | 'hard';
  
  // Challenge types to use (default: all)
  challengeTypes?: ChallengeType[];
  
  // Expiration time in ms (default: 30000)
  expirationMs?: number;
  
  // Rate limiting config
  rateLimit?: {
    maxAttempts: number;  // default: 10
    windowMs: number;     // default: 60000
  };
}
```

## Security Features

- **HMAC Signing**: All challenges are signed to prevent tampering
- **Timing-Safe Comparison**: Prevents timing attacks on solution verification
- **Rate Limiting**: Built-in protection against brute force attempts
- **Expiration**: Challenges expire to prevent replay attacks
- **One-Time Use**: Each challenge can only be solved once

## API Reference

### Server

#### `UnCaptcha`

```typescript
const uncaptcha = new UnCaptcha(config);

// Generate a new challenge
uncaptcha.generate(options?): { challenge, expectedAnswer }

// Verify a solution (stateful - requires stored expected answer)
uncaptcha.verify(challenge, solution, clientId?): VerificationResult

// Verify a solution (stateless - uses signature)
uncaptcha.verifyStateless(challenge, solution, clientId?): VerificationResult

// Get rate limit status
uncaptcha.getRateLimitStatus(clientId): { remaining, isLimited }

// Get monitoring stats
uncaptcha.getStats(): { pendingChallenges, rateLimitStats }

// Clean up resources
uncaptcha.destroy(): void
```

#### Express Middleware

```typescript
const { protect, challenge, generator, verifier } = createExpressMiddleware(config);

// protect - Middleware that requires valid challenge solution
// challenge - Handler that returns new challenges
// generator - Underlying ChallengeGenerator instance
// verifier - Underlying ChallengeVerifier instance
```

### Client

#### `UnCaptchaSolver`

```typescript
const solver = new UnCaptchaSolver(options?);

// Solve a challenge
solver.solve(challenge): SolutionResult

// Get headers for HTTP request
solver.solveForRequest(challenge): { headers, body, success, error? }

// Fetch challenge and solve
solver.fetchAndSolve(url, fetchOptions?): Promise<...>

// Complete entire protected request flow
solver.completeProtectedRequest(challengeUrl, protectedUrl, options?): Promise<Response>
```

## Difficulty Levels

| Level | Operation Count | Encoding | Time Limit |
|-------|----------------|----------|------------|
| Easy | 3 operations | Plain/Base64 | 30s |
| Medium | 5 operations | Base64/Rot13 | 30s |
| Hard | 7 operations | Hex/Rot13 | 30s |

## License

MIT
