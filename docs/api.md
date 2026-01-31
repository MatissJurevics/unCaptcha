# API Reference

## Server-Side

### `createExpressMiddleware(config)`

Creates Express middleware for protecting routes.

```typescript
import { createExpressMiddleware } from 'captchalm';

const { protect, challenge, generator, verifier } = createExpressMiddleware({
  secret: 'your-secret-key',
  difficulty: 'medium',
  expirationMs: 30000,
  rateLimit: { maxAttempts: 10, windowMs: 60000 }
});
```

**Returns:**
- `protect` - Middleware that requires valid challenge solution
- `challenge` - Handler that returns new challenges
- `generator` - Underlying ChallengeGenerator instance
- `verifier` - Underlying ChallengeVerifier instance

---

### `CaptchaLM` Class

Standalone API for custom integrations.

```typescript
import { CaptchaLM } from 'captchalm';

const captchalm = new CaptchaLM({
  secret: 'your-secret-key',
  difficulty: 'medium',
});
```

#### Methods

##### `generate(options?)`

Generate a new challenge.

```typescript
const { challenge, expectedAnswer } = captchalm.generate({
  type: 'function_execution',  // Optional: specific challenge type
  difficulty: 'hard',          // Optional: override difficulty
});
```

##### `verify(challenge, solution, clientId?)`

Verify a solution (stateful mode - uses stored expected answer).

```typescript
const result = captchalm.verify(challenge, userSolution, 'client-ip');

if (result.valid) {
  // Grant access
} else {
  console.log(result.error);      // "Incorrect solution"
  console.log(result.errorCode);  // "INVALID_SOLUTION"
}
```

##### `verifyStateless(challenge, solution, clientId?)`

Verify using only the signature (for distributed deployments).

```typescript
const result = captchalm.verifyStateless(challenge, userSolution);
```

##### `getRateLimitStatus(clientId)`

Check rate limit status for a client.

```typescript
const status = captchalm.getRateLimitStatus('client-ip');
// { remaining: 8, isLimited: false }
```

##### `getStats()`

Get monitoring statistics.

```typescript
const stats = captchalm.getStats();
// { pendingChallenges: 42, rateLimitStats: { activeKeys: 10, totalAttempts: 156 } }
```

##### `destroy()`

Clean up resources (stop cleanup intervals).

```typescript
captchalm.destroy();
```

---

## Client-Side

### `CaptchaLMSolver` Class

Solver for AI agents to complete challenges.

```typescript
import { CaptchaLMSolver } from 'captchalm/client';

const solver = new CaptchaLMSolver({
  timeout: 10000,  // Optional: solving timeout
  debug: true,     // Optional: enable logging
});
```

#### Methods

##### `solve(challenge)`

Solve a challenge you already have.

```typescript
const result = solver.solve(challenge);

if (result.success) {
  console.log(result.solution);       // The answer
  console.log(result.solveDuration);  // Time taken (ms)
} else {
  console.log(result.error);          // Error message
}
```

##### `solveForRequest(challenge)`

Get formatted headers and body for HTTP request.

```typescript
const { headers, body, success } = solver.solveForRequest(challenge);

// headers: { 'x-captchalm-id': '...', 'x-captchalm-solution': '...' }
// body: { _CaptchaLMChallenge: {...} }
```

##### `fetchAndSolve(url, options?)`

Fetch a challenge from server and solve it.

```typescript
const { challenge, solution, success, error } = await solver.fetchAndSolve(
  'https://api.example.com/challenge'
);
```

##### `completeProtectedRequest(challengeUrl, protectedUrl, options?)`

Complete flow: fetch challenge, solve, and make protected request.

```typescript
const response = await solver.completeProtectedRequest(
  'https://api.example.com/challenge',
  'https://api.example.com/api/protected',
  {
    method: 'POST',
    body: JSON.stringify({ data: 'my-data' })
  }
);
```

---

## Types

### Challenge

```typescript
interface Challenge {
  id: string;
  type: 'function_execution' | 'chained_operations' | 'encoded_instruction' | 'pattern_extraction' | 'code_transform';
  difficulty: 'easy' | 'medium' | 'hard';
  payload: ChallengePayload;
  expiresAt: number;
  signature: string;
}
```

### VerificationResult

```typescript
interface VerificationResult {
  valid: boolean;
  error?: string;
  errorCode?: 'EXPIRED' | 'INVALID_SIGNATURE' | 'INVALID_SOLUTION' | 'RATE_LIMITED' | 'CHALLENGE_NOT_FOUND';
}
```

### CaptchaLMConfig

```typescript
interface CaptchaLMConfig {
  secret: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  challengeTypes?: ChallengeType[];
  expirationMs?: number;
  rateLimit?: {
    maxAttempts: number;
    windowMs: number;
  };
}
```
