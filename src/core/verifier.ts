/**
 * Challenge verifier for unCaptcha
 */

import type {
    Challenge,
    VerificationResult,
    UnCaptchaConfig,
    ChallengeSolution,
} from './types';
import { signChallenge, safeCompare } from '../utils/crypto';
import { RateLimiter, createRateLimiter } from '../utils/rate-limiter';

/**
 * Store for expected answers (server-side only)
 */
interface ChallengeStore {
    expectedAnswer: string;
    expiresAt: number;
}

/**
 * Challenge verifier class
 */
export class ChallengeVerifier {
    private config: Required<UnCaptchaConfig>;
    private rateLimiter: RateLimiter;
    private challengeStore: Map<string, ChallengeStore> = new Map();
    private cleanupInterval: NodeJS.Timeout | null = null;

    constructor(config: UnCaptchaConfig) {
        this.config = {
            difficulty: 'medium',
            challengeTypes: ['function_execution', 'chained_operations', 'encoded_instruction'],
            expirationMs: 30000,
            rateLimit: {
                maxAttempts: 10,
                windowMs: 60000,
            },
            ...config,
        };

        this.rateLimiter = createRateLimiter(this.config.rateLimit);
        this.startCleanup();
    }

    /**
     * Store expected answer for a challenge
     */
    storeChallenge(challengeId: string, expectedAnswer: string, expiresAt: number): void {
        this.challengeStore.set(challengeId, { expectedAnswer, expiresAt });
    }

    /**
     * Verify a challenge solution
     */
    verify(
        challenge: Challenge,
        solution: ChallengeSolution,
        clientIdentifier?: string
    ): VerificationResult {
        const clientKey = clientIdentifier || 'anonymous';

        // Check rate limiting
        const rateLimitResult = this.rateLimiter.recordAttempt(clientKey);
        if (!rateLimitResult.allowed) {
            return {
                valid: false,
                error: `Rate limited. Try again in ${Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000)} seconds.`,
                errorCode: 'RATE_LIMITED',
            };
        }

        // Check if challenge ID matches
        if (challenge.id !== solution.challengeId) {
            return {
                valid: false,
                error: 'Challenge ID mismatch',
                errorCode: 'CHALLENGE_NOT_FOUND',
            };
        }

        // Check expiration
        if (Date.now() > challenge.expiresAt) {
            return {
                valid: false,
                error: 'Challenge has expired',
                errorCode: 'EXPIRED',
            };
        }

        // Get stored expected answer
        const stored = this.challengeStore.get(challenge.id);
        if (!stored) {
            return {
                valid: false,
                error: 'Challenge not found or already used',
                errorCode: 'CHALLENGE_NOT_FOUND',
            };
        }

        // Verify the stored challenge hasn't expired
        if (Date.now() > stored.expiresAt) {
            this.challengeStore.delete(challenge.id);
            return {
                valid: false,
                error: 'Challenge has expired',
                errorCode: 'EXPIRED',
            };
        }

        // Verify the signature
        const signatureData = JSON.stringify({
            id: challenge.id,
            type: challenge.type,
            payload: challenge.payload,
            expiresAt: challenge.expiresAt,
            expectedAnswer: stored.expectedAnswer,
        });

        const expectedSignature = signChallenge(signatureData, this.config.secret);

        if (!safeCompare(challenge.signature, expectedSignature)) {
            return {
                valid: false,
                error: 'Invalid challenge signature',
                errorCode: 'INVALID_SIGNATURE',
            };
        }

        // Verify the solution using timing-safe comparison
        if (!safeCompare(solution.solution, stored.expectedAnswer)) {
            return {
                valid: false,
                error: 'Incorrect solution',
                errorCode: 'INVALID_SOLUTION',
            };
        }

        // Solution is correct - remove from store (one-time use)
        this.challengeStore.delete(challenge.id);

        // Reset rate limit on successful verification
        this.rateLimiter.reset(clientKey);

        return { valid: true };
    }

    /**
     * Verify a solution using only the signature (stateless mode)
     * 
     * In stateless mode, the expected answer is encoded in the signature
     * This is less secure but allows for distributed deployments
     */
    verifyStateless(
        challenge: Challenge,
        solution: ChallengeSolution,
        clientIdentifier?: string
    ): VerificationResult {
        const clientKey = clientIdentifier || 'anonymous';

        // Check rate limiting
        const rateLimitResult = this.rateLimiter.recordAttempt(clientKey);
        if (!rateLimitResult.allowed) {
            return {
                valid: false,
                error: `Rate limited. Try again in ${Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000)} seconds.`,
                errorCode: 'RATE_LIMITED',
            };
        }

        // Check if challenge ID matches
        if (challenge.id !== solution.challengeId) {
            return {
                valid: false,
                error: 'Challenge ID mismatch',
                errorCode: 'CHALLENGE_NOT_FOUND',
            };
        }

        // Check expiration
        if (Date.now() > challenge.expiresAt) {
            return {
                valid: false,
                error: 'Challenge has expired',
                errorCode: 'EXPIRED',
            };
        }

        // In stateless mode, we verify by reconstructing the signature
        // The solution must produce a matching signature when combined with the challenge
        const signatureData = JSON.stringify({
            id: challenge.id,
            type: challenge.type,
            payload: challenge.payload,
            expiresAt: challenge.expiresAt,
            expectedAnswer: solution.solution,
        });

        const computedSignature = signChallenge(signatureData, this.config.secret);

        if (!safeCompare(challenge.signature, computedSignature)) {
            return {
                valid: false,
                error: 'Incorrect solution',
                errorCode: 'INVALID_SOLUTION',
            };
        }

        return { valid: true };
    }

    /**
     * Get rate limit status for a client
     */
    getRateLimitStatus(clientIdentifier: string): {
        remaining: number;
        isLimited: boolean;
    } {
        return {
            remaining: this.rateLimiter.getRemainingAttempts(clientIdentifier),
            isLimited: this.rateLimiter.isRateLimited(clientIdentifier),
        };
    }

    /**
     * Start periodic cleanup of expired challenges
     */
    private startCleanup(): void {
        this.cleanupInterval = setInterval(() => {
            this.cleanup();
        }, 60000); // Every minute

        if (this.cleanupInterval.unref) {
            this.cleanupInterval.unref();
        }
    }

    /**
     * Clean up expired challenges
     */
    private cleanup(): void {
        const now = Date.now();

        for (const [id, stored] of this.challengeStore) {
            if (now > stored.expiresAt) {
                this.challengeStore.delete(id);
            }
        }
    }

    /**
     * Destroy the verifier and clean up resources
     */
    destroy(): void {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }
        this.rateLimiter.destroy();
        this.challengeStore.clear();
    }

    /**
     * Get stats for monitoring
     */
    getStats(): {
        pendingChallenges: number;
        rateLimitStats: { activeKeys: number; totalAttempts: number };
    } {
        return {
            pendingChallenges: this.challengeStore.size,
            rateLimitStats: this.rateLimiter.getStats(),
        };
    }
}

/**
 * Create a challenge verifier
 */
export function createVerifier(config: UnCaptchaConfig): ChallengeVerifier {
    return new ChallengeVerifier(config);
}
