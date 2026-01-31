/**
 * CaptchaLM - AI-Only Access Control
 * 
 * Core type definitions for challenges, responses, and configurations
 */

// ============================================================================
// Encoding Types
// ============================================================================

export type EncodingType = 'plain' | 'base64' | 'hex' | 'rot13';

// ============================================================================
// Challenge Types
// ============================================================================

export type ChallengeType =
    | 'function_execution'
    | 'chained_operations'
    | 'encoded_instruction'
    | 'pattern_extraction'
    | 'code_transform';

// ============================================================================
// Challenge Payloads
// ============================================================================

/**
 * Function Execution Challenge
 * Present a function definition and parameters, expect computed output
 */
export interface FunctionExecutionPayload {
    type: 'function_execution';
    /** The function name to execute */
    functionName: string;
    /** Function code as a string */
    functionCode: string;
    /** Parameters to pass to the function */
    parameters: unknown[];
    /** Required encoding for the response */
    responseEncoding: EncodingType;
}

/**
 * Chained Operations Challenge
 * Multi-step instructions requiring sequential execution
 */
export interface ChainedOperationsPayload {
    type: 'chained_operations';
    /** Initial value to start with */
    initialValue: number;
    /** Operations to apply sequentially */
    operations: ChainedOperation[];
    /** Required encoding for the response */
    responseEncoding: EncodingType;
}

export interface ChainedOperation {
    operation: 'add' | 'subtract' | 'multiply' | 'divide' | 'modulo' | 'power' | 'floor' | 'ceil' | 'abs' | 'negate';
    value?: number;
}

/**
 * Encoded Instruction Challenge
 * Instructions encoded in various formats
 */
export interface EncodedInstructionPayload {
    type: 'encoded_instruction';
    /** The encoded instruction */
    instruction: string;
    /** How the instruction is encoded */
    instructionEncoding: EncodingType;
    /** Required encoding for the response */
    responseEncoding: EncodingType;
}

/**
 * Pattern Extraction Challenge
 * Extract specific patterns from structured data
 */
export interface PatternExtractionPayload {
    type: 'pattern_extraction';
    /** The data to query */
    data: Record<string, unknown>;
    /** The query expression */
    query: string;
    /** Required encoding for the response */
    responseEncoding: EncodingType;
}

/**
 * Code Transform Challenge
 * Transform code according to specified rules
 */
export interface CodeTransformPayload {
    type: 'code_transform';
    /** The code to transform/execute */
    code: string;
    /** The transformation to apply */
    transform: 'execute' | 'execute_and_hash' | 'execute_and_base64';
    /** Required encoding for the response */
    responseEncoding: EncodingType;
}

export type ChallengePayload =
    | FunctionExecutionPayload
    | ChainedOperationsPayload
    | EncodedInstructionPayload
    | PatternExtractionPayload
    | CodeTransformPayload;

// ============================================================================
// Challenge
// ============================================================================

export interface Challenge {
    /** Unique challenge identifier */
    id: string;
    /** Type of challenge */
    type: ChallengeType;
    /** Difficulty level */
    difficulty: ChallengeDifficulty;
    /** Challenge-specific payload */
    payload: ChallengePayload;
    /** Expiration timestamp (Unix ms) */
    expiresAt: number;
    /** HMAC signature for integrity verification */
    signature: string;
}

export type ChallengeDifficulty = 'easy' | 'medium' | 'hard';

// ============================================================================
// Solution & Verification
// ============================================================================

export interface ChallengeSolution {
    /** Challenge ID being solved */
    challengeId: string;
    /** The computed solution */
    solution: string;
}

export interface VerificationResult {
    /** Whether the solution is valid */
    valid: boolean;
    /** Error message if invalid */
    error?: string;
    /** Error code for programmatic handling */
    errorCode?: VerificationErrorCode;
}

export type VerificationErrorCode =
    | 'EXPIRED'
    | 'INVALID_SIGNATURE'
    | 'INVALID_SOLUTION'
    | 'RATE_LIMITED'
    | 'CHALLENGE_NOT_FOUND';

// ============================================================================
// Configuration
// ============================================================================

export interface CaptchaLMConfig {
    /** Secret key for HMAC signing */
    secret: string;
    /** Default difficulty level */
    difficulty?: ChallengeDifficulty;
    /** Challenge types to use (defaults to all) */
    challengeTypes?: ChallengeType[];
    /** Challenge expiration time in milliseconds */
    expirationMs?: number;
    /** Rate limiting configuration */
    rateLimit?: RateLimitConfig;
}

export interface RateLimitConfig {
    /** Maximum attempts per window */
    maxAttempts: number;
    /** Window duration in milliseconds */
    windowMs: number;
}

// ============================================================================
// Function Registry
// ============================================================================

export interface RegisteredFunction {
    /** Function name */
    name: string;
    /** Function implementation */
    fn: (...args: unknown[]) => unknown;
    /** Parameter types for validation */
    parameterTypes: string[];
    /** Description for documentation */
    description: string;
    /** Difficulty level of this function */
    difficulty: ChallengeDifficulty;
}

// ============================================================================
// Middleware Types
// ============================================================================

export interface MiddlewareConfig extends CaptchaLMConfig {
    /** Header name for challenge ID */
    challengeIdHeader?: string;
    /** Header name for solution */
    solutionHeader?: string;
    /** Path to challenge endpoint */
    challengeEndpoint?: string;
}
