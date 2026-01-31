/**
 * Standalone CaptchaLM API
 * Framework-agnostic implementation for custom integrations
 */

import type {
    Challenge,
    ChallengeSolution,
    VerificationResult,
    CaptchaLMConfig,
    ChallengeDifficulty,
    ChallengeType,
} from '../core/types';
import { ChallengeGenerator } from '../core/generator';
import { ChallengeVerifier } from '../core/verifier';

/**
 * Main CaptchaLM class for standalone usage
 */
export class CaptchaLM {
    private generator: ChallengeGenerator;
    private verifier: ChallengeVerifier;
    private config: CaptchaLMConfig;

    constructor(config: CaptchaLMConfig) {
        this.config = config;
        this.generator = new ChallengeGenerator(config);
        this.verifier = new ChallengeVerifier(config);
    }

    /**
     * Generate a new challenge
     */
    generate(options?: {
        type?: ChallengeType;
        difficulty?: ChallengeDifficulty;
    }): {
        challenge: Challenge;
        expectedAnswer: string;
    } {
        const result = this.generator.generate(options);

        // Store for verification
        this.verifier.storeChallenge(
            result.challenge.id,
            result.expectedAnswer,
            result.challenge.expiresAt
        );

        return result;
    }

    /**
     * Verify a challenge solution
     */
    verify(
        challenge: Challenge,
        solution: string,
        clientIdentifier?: string
    ): VerificationResult {
        const challengeSolution: ChallengeSolution = {
            challengeId: challenge.id,
            solution,
        };

        return this.verifier.verify(challenge, challengeSolution, clientIdentifier);
    }

    /**
     * Verify a challenge solution in stateless mode
     * (no server-side storage required)
     */
    verifyStateless(
        challenge: Challenge,
        solution: string,
        clientIdentifier?: string
    ): VerificationResult {
        const challengeSolution: ChallengeSolution = {
            challengeId: challenge.id,
            solution,
        };

        return this.verifier.verifyStateless(challenge, challengeSolution, clientIdentifier);
    }

    /**
     * Get rate limit status for a client
     */
    getRateLimitStatus(clientIdentifier: string): {
        remaining: number;
        isLimited: boolean;
    } {
        return this.verifier.getRateLimitStatus(clientIdentifier);
    }

    /**
     * Get stats for monitoring
     */
    getStats(): {
        pendingChallenges: number;
        rateLimitStats: { activeKeys: number; totalAttempts: number };
    } {
        return this.verifier.getStats();
    }

    /**
     * Get the current configuration
     */
    getConfig(): CaptchaLMConfig {
        return { ...this.config };
    }

    /**
     * Destroy and clean up resources
     */
    destroy(): void {
        this.verifier.destroy();
    }
}

/**
 * Create an CaptchaLM instance
 */
export function createCaptchaLM(config: CaptchaLMConfig): CaptchaLM {
    return new CaptchaLM(config);
}
