/**
 * unCaptcha - AI-Only Access Control
 * 
 * A reverse CAPTCHA library that allows AI agents while blocking humans
 */

// Core exports
export * from './core/types';
export * from './core/encoding';
export { ChallengeGenerator, createGenerator } from './core/generator';
export { ChallengeVerifier, createVerifier } from './core/verifier';

// Server exports
export { UnCaptcha, createUnCaptcha } from './server/standalone';
export { createExpressMiddleware, createVerificationEndpoint } from './server/middleware';
export type { UnCaptchaRequest } from './server/middleware';

// Function registry
export {
    allFunctions,
    getFunctionByName,
    getFunctionsByDifficulty,
    getFunctionsByCategory,
    getRandomFunction,
    functionCategories,
} from './functions';

// Re-export types for convenience
export type {
    Challenge,
    ChallengeType,
    ChallengeDifficulty,
    ChallengePayload,
    ChallengeSolution,
    VerificationResult,
    VerificationErrorCode,
    UnCaptchaConfig,
    RateLimitConfig,
    MiddlewareConfig,
    RegisteredFunction,
    EncodingType,
} from './core/types';
