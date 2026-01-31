/**
 * Express middleware for unCaptcha
 */

import type { Request, Response, NextFunction, RequestHandler } from 'express';
import type {
    MiddlewareConfig,
    Challenge,
    ChallengeSolution
} from '../core/types';
import { ChallengeGenerator } from '../core/generator';
import { ChallengeVerifier } from '../core/verifier';

/**
 * Extended request with unCaptcha properties
 */
export interface UnCaptchaRequest extends Request {
    unCaptcha?: {
        verified: boolean;
        challenge?: Challenge;
        clientIdentifier: string;
    };
}

/**
 * Default middleware configuration
 */
const DEFAULT_MIDDLEWARE_CONFIG: Partial<MiddlewareConfig> = {
    challengeIdHeader: 'x-uncaptcha-id',
    solutionHeader: 'x-uncaptcha-solution',
    challengeEndpoint: '/_uncaptcha/challenge',
};

/**
 * Build human/LLM-readable instructions for solving a challenge
 */
function buildSolvingInstructions(challenge: Challenge): string {
    const payload = challenge.payload as unknown as Record<string, unknown>;
    const responseEncoding = (payload.responseEncoding as string) || 'plain';

    let instructions = '';

    switch (challenge.type) {
        case 'function_execution':
            instructions = `TASK: Execute the following function with the given parameters.

FUNCTION:
${payload.functionCode}

PARAMETERS: ${JSON.stringify(payload.parameters)}

STEPS:
1. Execute ${payload.functionName}(${(payload.parameters as unknown[]).join(', ')})
2. Take the result and encode it as: ${responseEncoding}
3. Submit the encoded result as your answer`;
            break;

        case 'chained_operations':
            const ops = payload.operations as Array<{ operation: string; value?: number }>;
            const opList = ops.map((op, i) =>
                `   ${i + 1}. ${op.operation}${op.value !== undefined ? ` ${op.value}` : ''}`
            ).join('\n');
            instructions = `TASK: Apply these operations to the initial value in order.

INITIAL VALUE: ${payload.initialValue}

OPERATIONS:
${opList}

STEPS:
1. Start with ${payload.initialValue}
2. Apply each operation in sequence
3. Encode the final result as: ${responseEncoding}
4. Submit the encoded result as your answer`;
            break;

        case 'encoded_instruction':
            instructions = `TASK: Decode the instruction, compute the result, and encode your answer.

ENCODED INSTRUCTION: ${payload.instruction}
INSTRUCTION ENCODING: ${payload.instructionEncoding}

STEPS:
1. Decode the instruction from ${payload.instructionEncoding}
2. The decoded text will be a math expression like "Calculate: X + Y"
3. Compute the result
4. Encode your answer as: ${responseEncoding}
5. Submit the encoded result`;
            break;

        case 'pattern_extraction':
            instructions = `TASK: Query the data and compute the result.

DATA:
${JSON.stringify(payload.data, null, 2)}

QUERY: ${payload.query}

STEPS:
1. Parse the query (e.g., "sum(items[*].value)" means sum all 'value' fields in 'items' array)
2. Execute the query on the data
3. Encode the result as: ${responseEncoding}
4. Submit the encoded result`;
            break;

        case 'code_transform':
            instructions = `TASK: Execute the code and return the result.

CODE:
${payload.code}

TRANSFORM: ${payload.transform}

STEPS:
1. Execute the JavaScript code (it uses 'return' to return a value)
2. Apply transform: ${payload.transform === 'execute' ? 'just use the result' : payload.transform}
3. Encode the result as: ${responseEncoding}
4. Submit the encoded result`;
            break;

        default:
            instructions = `TASK: Solve the challenge of type "${challenge.type}" using the payload data.`;
    }

    // Add encoding help
    instructions += `

ENCODING REFERENCE:
- plain: Return the value as a string (e.g., 42 → "42")
- base64: Base64 encode (e.g., 42 → "NDI=")
- hex: Hex encode each character (e.g., 42 → "3432")
- rot13: Shift each letter by 13 (e.g., "abc" → "nop")`;

    return instructions;
}

/**
 * Create Express middleware for unCaptcha protection
 */
export function createExpressMiddleware(config: MiddlewareConfig): {
    protect: RequestHandler;
    challenge: RequestHandler;
    generator: ChallengeGenerator;
    verifier: ChallengeVerifier;
} {
    const fullConfig = { ...DEFAULT_MIDDLEWARE_CONFIG, ...config } as Required<MiddlewareConfig>;

    const generator = new ChallengeGenerator(fullConfig);
    const verifier = new ChallengeVerifier(fullConfig);

    /**
     * Get client identifier from request
     */
    function getClientIdentifier(req: Request): string {
        // Try various headers for client identification
        const forwarded = req.headers['x-forwarded-for'];
        if (forwarded) {
            const ip = Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0];
            return ip.trim();
        }

        return req.ip || req.socket.remoteAddress || 'unknown';
    }

    /**
     * Challenge endpoint handler
     * Returns a new challenge for clients to solve
     */
    const challenge: RequestHandler = (_req: Request, res: Response): void => {
        try {
            const { challenge, expectedAnswer } = generator.generate();

            // Store the expected answer for verification
            verifier.storeChallenge(challenge.id, expectedAnswer, challenge.expiresAt);

            res.json({
                success: true,
                challenge: {
                    id: challenge.id,
                    type: challenge.type,
                    difficulty: challenge.difficulty,
                    payload: challenge.payload,
                    expiresAt: challenge.expiresAt,
                    signature: challenge.signature,
                },
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: 'Failed to generate challenge',
            });
        }
    };

    /**
     * Protection middleware
     * Verifies that the request contains a valid challenge solution
     */
    const protect: RequestHandler = (
        req: UnCaptchaRequest,
        res: Response,
        next: NextFunction
    ): void => {
        const clientIdentifier = getClientIdentifier(req);

        // Initialize unCaptcha context
        req.unCaptcha = {
            verified: false,
            clientIdentifier,
        };

        // Get challenge ID and solution from headers
        const challengeId = req.headers[fullConfig.challengeIdHeader] as string | undefined;
        const solution = req.headers[fullConfig.solutionHeader] as string | undefined;

        if (!challengeId || !solution) {
            // Generate a challenge inline and return with solving instructions
            const { challenge, expectedAnswer } = generator.generate();
            verifier.storeChallenge(challenge.id, expectedAnswer, challenge.expiresAt);

            res.status(401).json({
                success: false,
                error: 'AI verification required',
                uncaptcha: {
                    challenge: challenge,
                    instructions: buildSolvingInstructions(challenge),
                    howToSubmit: {
                        headers: {
                            [fullConfig.challengeIdHeader]: challenge.id,
                            [fullConfig.solutionHeader]: '<your_computed_answer>'
                        },
                        body: {
                            _unCaptchaChallenge: challenge
                        },
                        note: 'Retry your original request with these headers and body field added'
                    }
                }
            });
            return;
        }

        // Try to get challenge data from body or reconstruct
        let challengeData: Challenge | undefined;

        // Check if challenge data is in the request body
        if (req.body && req.body._unCaptchaChallenge) {
            challengeData = req.body._unCaptchaChallenge;
        } else {
            // For stateless verification, we need the challenge to be sent
            res.status(401).json({
                success: false,
                error: 'Challenge data required. Include _unCaptchaChallenge in body or use stateless mode.',
            });
            return;
        }

        const challengeSolution: ChallengeSolution = {
            challengeId,
            solution,
        };

        // Verify the solution
        const result = verifier.verify(challengeData!, challengeSolution, clientIdentifier);

        if (!result.valid) {
            const statusCode = result.errorCode === 'RATE_LIMITED' ? 429 : 401;

            res.status(statusCode).json({
                success: false,
                error: result.error,
                errorCode: result.errorCode,
            });
            return;
        }

        // Mark as verified
        req.unCaptcha.verified = true;
        req.unCaptcha.challenge = challengeData;

        next();
    };

    return {
        protect,
        challenge,
        generator,
        verifier,
    };
}

/**
 * Create a simple verification endpoint
 */
export function createVerificationEndpoint(config: MiddlewareConfig): RequestHandler {
    const fullConfig = { ...DEFAULT_MIDDLEWARE_CONFIG, ...config } as Required<MiddlewareConfig>;
    const verifier = new ChallengeVerifier(fullConfig);

    return (req: Request, res: Response): void => {
        const clientIdentifier = req.ip || 'unknown';

        const { challenge, solution } = req.body;

        if (!challenge || !solution) {
            res.status(400).json({
                success: false,
                error: 'Missing challenge or solution in request body',
            });
            return;
        }

        const challengeSolution: ChallengeSolution = {
            challengeId: challenge.id,
            solution,
        };

        const result = verifier.verifyStateless(challenge, challengeSolution, clientIdentifier);

        res.json({
            success: result.valid,
            error: result.error,
            errorCode: result.errorCode,
        });
    };
}
