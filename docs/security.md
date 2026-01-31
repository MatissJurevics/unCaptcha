# Security Guide

## Overview

unCaptcha is designed with security in mind. This document covers the security mechanisms and best practices.

---

## Security Features

### 1. HMAC Signing

Every challenge is signed with HMAC-SHA256 using your secret key. This prevents:
- **Challenge tampering** - Modifications invalidate the signature
- **Answer manipulation** - Expected answer is part of the signature data

```javascript
// Signature is computed from:
{
  id: challenge.id,
  type: challenge.type,
  payload: challenge.payload,
  expiresAt: challenge.expiresAt,
  expectedAnswer: answer
}
```

### 2. Timing-Safe Comparison

Solution verification uses `crypto.timingSafeEqual` to prevent timing attacks:

```javascript
// Bad: vulnerable to timing attacks
if (userSolution === expectedAnswer) { ... }

// Good: constant-time comparison
if (timingSafeEqual(userSolution, expectedAnswer)) { ... }
```

### 3. Rate Limiting

Built-in rate limiting prevents brute force attacks:

```javascript
rateLimit: {
  maxAttempts: 10,    // Max 10 attempts
  windowMs: 60000     // Per minute
}
```

After exceeding the limit, clients receive a `429 Too Many Requests` response.

### 4. Challenge Expiration

Challenges expire after a configurable time (default 30 seconds):

- Prevents replay attacks
- Limits the window for brute force attempts
- Encourages immediate solving (favors agents)

### 5. One-Time Use

Each challenge can only be solved once:

- After successful verification, the challenge is deleted
- Prevents replay attacks with valid solutions

---

## Best Practices

### 1. Use a Strong Secret

```javascript
// Bad
secret: 'password123'

// Good - use environment variable with strong random value
secret: process.env.UNCAPTCHA_SECRET  // 32+ random bytes
```

Generate a secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 2. Set Appropriate Difficulty

| Scenario | Recommended |
|----------|-------------|
| High-security API | `hard` |
| General protection | `medium` |
| Light filtering | `easy` |

### 3. Configure Rate Limits

Adjust based on your use case:

```javascript
// Strict - high-security
rateLimit: { maxAttempts: 3, windowMs: 60000 }

// Lenient - allow retries
rateLimit: { maxAttempts: 20, windowMs: 60000 }
```

### 4. Use HTTPS

Always use HTTPS in production to prevent:
- Man-in-the-middle attacks
- Challenge/solution interception
- Secret key exposure

### 5. Monitor Statistics

Regularly check stats for anomalies:

```javascript
const stats = uncaptcha.getStats();
console.log('Pending challenges:', stats.pendingChallenges);
console.log('Rate limited clients:', stats.rateLimitStats.activeKeys);
```

---

## Stateful vs Stateless Mode

### Stateful (Default)

- Server stores expected answers
- More secure (answers never leave server)
- Requires shared state in distributed systems

### Stateless

- Answer encoded in challenge signature
- Works across multiple servers
- Slightly less secure (answer can be brute-forced from signature)

Use stateful mode when possible. Use stateless for distributed deployments without shared state.

---

## Potential Attack Vectors

### 1. Brute Force

**Mitigation:** Rate limiting, short expiration, hard difficulty

### 2. Replay Attacks

**Mitigation:** One-time use, challenge expiration

### 3. Signature Forgery

**Mitigation:** HMAC with secret key (computationally infeasible without key)

### 4. Timing Attacks

**Mitigation:** Timing-safe comparison

### 5. Human Assisted

**Note:** Determined humans could use external tools (calculators, decoders). unCaptcha is designed to make this tedious, not impossible. For high security, combine with other authentication methods.

---

## Incident Response

If you suspect your secret key is compromised:

1. **Rotate immediately** - Generate a new secret key
2. **Update configuration** - Deploy new secret to all servers
3. **Review logs** - Check for unusual access patterns
4. **Consider rate limit tightening** - Temporarily reduce limits
