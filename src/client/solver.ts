/**
 * Challenge solver for AI agents
 */

import type { Challenge, ChallengePayload } from '../core/types';
import { encode } from '../core/encoding';
import { executePayload } from './executor';

/**
 * Solver options
 */
export interface SolverOptions {
    /** Timeout for solving (ms) */
    timeout?: number;
    /** Enable debug logging */
    debug?: boolean;
}

/**
 * Solution result
 */
export interface SolutionResult {
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
export class UnCaptchaSolver {
    private options: Required<SolverOptions>;

    constructor(options?: SolverOptions) {
        this.options = {
            timeout: options?.timeout ?? 10000,
            debug: options?.debug ?? false,
        };
    }

    /**
     * Solve a challenge
     */
    solve(challenge: Challenge): SolutionResult {
        const startTime = Date.now();

        try {
            // Check if challenge is expired
            if (Date.now() > challenge.expiresAt) {
                return {
                    solution: '',
                    solveDuration: Date.now() - startTime,
                    success: false,
                    error: 'Challenge has expired',
                };
            }

            if (this.options.debug) {
                console.log(`[UnCaptcha] Solving ${challenge.type} challenge...`);
            }

            // Execute the payload to get the raw result
            const rawResult = executePayload(challenge.payload);

            // Encode the result according to the challenge's response encoding
            const responseEncoding = (challenge.payload as ChallengePayload & { responseEncoding?: string }).responseEncoding || 'plain';
            const solution = encode(String(rawResult), responseEncoding as 'plain' | 'base64' | 'hex' | 'rot13');

            const duration = Date.now() - startTime;

            if (this.options.debug) {
                console.log(`[UnCaptcha] Solved in ${duration}ms`);
            }

            return {
                solution,
                solveDuration: duration,
                success: true,
            };
        } catch (error) {
            const duration = Date.now() - startTime;
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';

            if (this.options.debug) {
                console.error(`[UnCaptcha] Failed to solve: ${errorMessage}`);
            }

            return {
                solution: '',
                solveDuration: duration,
                success: false,
                error: errorMessage,
            };
        }
    }

    /**
     * Solve a challenge and return formatted headers for HTTP request
     */
    solveForRequest(challenge: Challenge): {
        headers: Record<string, string>;
        body: { _unCaptchaChallenge: Challenge };
        success: boolean;
        error?: string;
    } {
        const result = this.solve(challenge);

        if (!result.success) {
            return {
                headers: {},
                body: { _unCaptchaChallenge: challenge },
                success: false,
                error: result.error,
            };
        }

        return {
            headers: {
                'x-uncaptcha-id': challenge.id,
                'x-uncaptcha-solution': result.solution,
            },
            body: {
                _unCaptchaChallenge: challenge,
            },
            success: true,
        };
    }

    /**
     * Fetch a challenge from a server and solve it
     */
    async fetchAndSolve(
        challengeUrl: string,
        fetchOptions?: RequestInit
    ): Promise<{
        challenge: Challenge;
        solution: string;
        success: boolean;
        error?: string;
    }> {
        try {
            const response = await fetch(challengeUrl, {
                method: 'GET',
                ...fetchOptions,
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch challenge: ${response.statusText}`);
            }

            const data = await response.json() as { success?: boolean; challenge?: Challenge; error?: string };

            if (!data.success || !data.challenge) {
                throw new Error(data.error || 'Invalid challenge response');
            }

            const challenge = data.challenge;
            const result = this.solve(challenge);

            return {
                challenge,
                solution: result.solution,
                success: result.success,
                error: result.error,
            };
        } catch (error) {
            return {
                challenge: null as unknown as Challenge,
                solution: '',
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
            };
        }
    }

    /**
     * Complete a protected request including challenge solving
     */
    async completeProtectedRequest(
        challengeUrl: string,
        protectedUrl: string,
        requestOptions?: RequestInit
    ): Promise<Response> {
        // Fetch and solve the challenge
        const { challenge, solution, success, error } = await this.fetchAndSolve(challengeUrl);

        if (!success) {
            throw new Error(`Failed to solve challenge: ${error}`);
        }

        // Make the protected request
        const headers = new Headers(requestOptions?.headers);
        headers.set('x-uncaptcha-id', challenge.id);
        headers.set('x-uncaptcha-solution', solution);
        headers.set('Content-Type', 'application/json');

        const body = requestOptions?.body
            ? { ...JSON.parse(requestOptions.body as string), _unCaptchaChallenge: challenge }
            : { _unCaptchaChallenge: challenge };

        return fetch(protectedUrl, {
            ...requestOptions,
            headers,
            body: JSON.stringify(body),
        });
    }
}

/**
 * Create a solver instance
 */
export function createSolver(options?: SolverOptions): UnCaptchaSolver {
    return new UnCaptchaSolver(options);
}
