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
            res.status(401).json({
                success: false,
                error: 'Missing challenge credentials',
                challengeEndpoint: fullConfig.challengeEndpoint,
                headers: {
                    challengeId: fullConfig.challengeIdHeader,
                    solution: fullConfig.solutionHeader,
                },
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
