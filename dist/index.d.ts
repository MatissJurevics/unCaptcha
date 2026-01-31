import { EncodingType, UnCaptchaConfig, ChallengeType, ChallengeDifficulty, Challenge, ChallengeSolution, VerificationResult, MiddlewareConfig, RegisteredFunction } from './core/types.js';
export { ChainedOperation, ChainedOperationsPayload, ChallengePayload, CodeTransformPayload, EncodedInstructionPayload, FunctionExecutionPayload, PatternExtractionPayload, RateLimitConfig, VerificationErrorCode } from './core/types.js';
import { Request, RequestHandler } from 'express';

/**
 * Encoding utilities for unCaptcha challenges
 */

/**
 * Encode a value using the specified encoding
 */
declare function encode(value: string, encoding: EncodingType): string;
/**
 * Decode a value using the specified encoding
 */
declare function decode(value: string, encoding: EncodingType): string;
/**
 * Base64 encode a string
 */
declare function encodeBase64(value: string): string;
/**
 * Base64 decode a string
 */
declare function decodeBase64(value: string): string;
/**
 * Hex encode a string
 */
declare function encodeHex(value: string): string;
/**
 * Hex decode a string
 */
declare function decodeHex(value: string): string;
/**
 * ROT13 encode/decode a string (symmetric cipher)
 */
declare function encodeRot13(value: string): string;
/**
 * ROT13 decode (same as encode, symmetric)
 */
declare function decodeRot13(value: string): string;
/**
 * Apply multiple encoding layers
 */
declare function encodeChain(value: string, encodings: EncodingType[]): string;
/**
 * Decode multiple encoding layers (in reverse order)
 */
declare function decodeChain(value: string, encodings: EncodingType[]): string;

/**
 * Challenge generator for unCaptcha
 */

/**
 * Challenge generator class
 */
declare class ChallengeGenerator {
    private config;
    constructor(config: UnCaptchaConfig);
    /**
     * Generate a new challenge
     */
    generate(overrides?: Partial<{
        type: ChallengeType;
        difficulty: ChallengeDifficulty;
    }>): {
        challenge: Challenge;
        expectedAnswer: string;
    };
    /**
     * Generate payload for a specific challenge type
     */
    private generatePayload;
    /**
     * Generate a function execution challenge
     */
    private generateFunctionExecution;
    /**
     * Generate a chained operations challenge
     */
    private generateChainedOperations;
    /**
     * Generate an encoded instruction challenge
     */
    private generateEncodedInstruction;
    /**
     * Generate a pattern extraction challenge
     */
    private generatePatternExtraction;
    /**
     * Generate a code transform challenge
     */
    private generateCodeTransform;
    /**
     * Get response encoding based on difficulty
     */
    private getResponseEncoding;
    /**
     * Get instruction encoding based on difficulty
     */
    private getInstructionEncoding;
    /**
     * Generate parameters for a function
     */
    private generateParameters;
    /**
     * Generate random words joined by spaces
     */
    private generateRandomWords;
    /**
     * Generate a random word
     */
    private generateRandomWord;
    /**
     * Mutate a word by changing N characters
     */
    private mutateWord;
    /**
     * Generate a random array of numbers
     */
    private generateRandomArray;
    /**
     * Get function code as string (for display)
     */
    private getFunctionCodeString;
}
/**
 * Create a challenge generator
 */
declare function createGenerator(config: UnCaptchaConfig): ChallengeGenerator;

/**
 * Challenge verifier for unCaptcha
 */

/**
 * Challenge verifier class
 */
declare class ChallengeVerifier {
    private config;
    private rateLimiter;
    private challengeStore;
    private cleanupInterval;
    constructor(config: UnCaptchaConfig);
    /**
     * Store expected answer for a challenge
     */
    storeChallenge(challengeId: string, expectedAnswer: string, expiresAt: number): void;
    /**
     * Verify a challenge solution
     */
    verify(challenge: Challenge, solution: ChallengeSolution, clientIdentifier?: string): VerificationResult;
    /**
     * Verify a solution using only the signature (stateless mode)
     *
     * In stateless mode, the expected answer is encoded in the signature
     * This is less secure but allows for distributed deployments
     */
    verifyStateless(challenge: Challenge, solution: ChallengeSolution, clientIdentifier?: string): VerificationResult;
    /**
     * Get rate limit status for a client
     */
    getRateLimitStatus(clientIdentifier: string): {
        remaining: number;
        isLimited: boolean;
    };
    /**
     * Start periodic cleanup of expired challenges
     */
    private startCleanup;
    /**
     * Clean up expired challenges
     */
    private cleanup;
    /**
     * Destroy the verifier and clean up resources
     */
    destroy(): void;
    /**
     * Get stats for monitoring
     */
    getStats(): {
        pendingChallenges: number;
        rateLimitStats: {
            activeKeys: number;
            totalAttempts: number;
        };
    };
}
/**
 * Create a challenge verifier
 */
declare function createVerifier(config: UnCaptchaConfig): ChallengeVerifier;

/**
 * Standalone unCaptcha API
 * Framework-agnostic implementation for custom integrations
 */

/**
 * Main unCaptcha class for standalone usage
 */
declare class UnCaptcha {
    private generator;
    private verifier;
    private config;
    constructor(config: UnCaptchaConfig);
    /**
     * Generate a new challenge
     */
    generate(options?: {
        type?: ChallengeType;
        difficulty?: ChallengeDifficulty;
    }): {
        challenge: Challenge;
        expectedAnswer: string;
    };
    /**
     * Verify a challenge solution
     */
    verify(challenge: Challenge, solution: string, clientIdentifier?: string): VerificationResult;
    /**
     * Verify a challenge solution in stateless mode
     * (no server-side storage required)
     */
    verifyStateless(challenge: Challenge, solution: string, clientIdentifier?: string): VerificationResult;
    /**
     * Get rate limit status for a client
     */
    getRateLimitStatus(clientIdentifier: string): {
        remaining: number;
        isLimited: boolean;
    };
    /**
     * Get stats for monitoring
     */
    getStats(): {
        pendingChallenges: number;
        rateLimitStats: {
            activeKeys: number;
            totalAttempts: number;
        };
    };
    /**
     * Get the current configuration
     */
    getConfig(): UnCaptchaConfig;
    /**
     * Destroy and clean up resources
     */
    destroy(): void;
}
/**
 * Create an unCaptcha instance
 */
declare function createUnCaptcha(config: UnCaptchaConfig): UnCaptcha;

/**
 * Express middleware for unCaptcha
 */

/**
 * Extended request with unCaptcha properties
 */
interface UnCaptchaRequest extends Request {
    unCaptcha?: {
        verified: boolean;
        challenge?: Challenge;
        clientIdentifier: string;
    };
}
/**
 * Create Express middleware for unCaptcha protection
 */
declare function createExpressMiddleware(config: MiddlewareConfig): {
    protect: RequestHandler;
    challenge: RequestHandler;
    generator: ChallengeGenerator;
    verifier: ChallengeVerifier;
};
/**
 * Create a simple verification endpoint
 */
declare function createVerificationEndpoint(config: MiddlewareConfig): RequestHandler;

/**
 * Function registry for unCaptcha challenges
 */

/**
 * Combined registry of all available functions
 */
declare const allFunctions: RegisteredFunction[];
/**
 * Get functions filtered by difficulty
 */
declare function getFunctionsByDifficulty(difficulty: ChallengeDifficulty): RegisteredFunction[];
/**
 * Get a function by name
 */
declare function getFunctionByName(name: string): RegisteredFunction | undefined;
/**
 * Get a random function matching the difficulty
 */
declare function getRandomFunction(difficulty?: ChallengeDifficulty): RegisteredFunction;
/**
 * Function categories for organization
 */
declare const functionCategories: {
    readonly math: RegisteredFunction[];
    readonly string: RegisteredFunction[];
    readonly array: RegisteredFunction[];
    readonly composite: RegisteredFunction[];
};
type FunctionCategory = keyof typeof functionCategories;
/**
 * Get functions by category
 */
declare function getFunctionsByCategory(category: FunctionCategory): RegisteredFunction[];

export { Challenge, ChallengeDifficulty, ChallengeGenerator, ChallengeSolution, ChallengeType, ChallengeVerifier, EncodingType, MiddlewareConfig, RegisteredFunction, UnCaptcha, UnCaptchaConfig, type UnCaptchaRequest, VerificationResult, allFunctions, createExpressMiddleware, createGenerator, createUnCaptcha, createVerificationEndpoint, createVerifier, decode, decodeBase64, decodeChain, decodeHex, decodeRot13, encode, encodeBase64, encodeChain, encodeHex, encodeRot13, functionCategories, getFunctionByName, getFunctionsByCategory, getFunctionsByDifficulty, getRandomFunction };
