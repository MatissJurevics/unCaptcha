import { ChainedOperationsPayload, ChallengePayload, Challenge } from '../core/types.mjs';

/**
 * Safe code executor for client-side challenge solving
 */

/**
 * Execute a function from code string
 * Uses Function constructor for sandboxed execution
 */
declare function executeFunction(code: string, params: unknown[]): unknown;
/**
 * Execute chained operations
 */
declare function executeChainedOperations(initialValue: number, operations: ChainedOperationsPayload['operations']): number;
/**
 * Parse and execute encoded instructions
 */
declare function executeEncodedInstruction(encodedInstruction: string, encoding: string): unknown;
/**
 * Execute pattern extraction query
 */
declare function executePatternExtraction(data: Record<string, unknown>, query: string): unknown;
/**
 * Execute code transform
 */
declare function executeCodeTransform(code: string, transform: string): unknown;
/**
 * Execute any challenge payload and return the result
 */
declare function executePayload(payload: ChallengePayload): unknown;

/**
 * Challenge solver for AI agents
 */

/**
 * Solver options
 */
interface SolverOptions {
    /** Timeout for solving (ms) */
    timeout?: number;
    /** Enable debug logging */
    debug?: boolean;
}
/**
 * Solution result
 */
interface SolutionResult {
    /** The computed solution */
    solution: string;
    /** Time taken to solve (ms) */
    solveDuration: number;
    /** Whether the solve was successful */
    success: boolean;
    /** Error message if failed */
    error?: string;
}
/**
 * UnCaptcha Solver for AI agents
 */
declare class UnCaptchaSolver {
    private options;
    constructor(options?: SolverOptions);
    /**
     * Solve a challenge
     */
    solve(challenge: Challenge): SolutionResult;
    /**
     * Solve a challenge and return formatted headers for HTTP request
     */
    solveForRequest(challenge: Challenge): {
        headers: Record<string, string>;
        body: {
            _unCaptchaChallenge: Challenge;
        };
        success: boolean;
        error?: string;
    };
    /**
     * Fetch a challenge from a server and solve it
     */
    fetchAndSolve(challengeUrl: string, fetchOptions?: RequestInit): Promise<{
        challenge: Challenge;
        solution: string;
        success: boolean;
        error?: string;
    }>;
    /**
     * Complete a protected request including challenge solving
     */
    completeProtectedRequest(challengeUrl: string, protectedUrl: string, requestOptions?: RequestInit): Promise<Response>;
}
/**
 * Create a solver instance
 */
declare function createSolver(options?: SolverOptions): UnCaptchaSolver;

export { type SolutionResult, type SolverOptions, UnCaptchaSolver, createSolver, executeChainedOperations, executeCodeTransform, executeEncodedInstruction, executeFunction, executePatternExtraction, executePayload };
