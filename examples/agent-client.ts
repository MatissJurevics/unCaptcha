/**
 * AI Agent client example for CaptchaLM
 * 
 * This demonstrates how an AI agent would interact with
 * an CaptchaLM-protected API.
 */

import { CaptchaLMSolver } from '../src/client';

const CHALLENGE_URL = 'http://localhost:3000/_captchalm/challenge';
const PROTECTED_URL = 'http://localhost:3000/api/data';

async function main() {
    console.log('🤖 AI Agent CaptchaLM Client Demo\n');

    // Create a solver instance
    const solver = new CaptchaLMSolver({
        debug: true, // Enable debug logging
    });

    try {
        // Method 1: Complete request flow (recommended)
        console.log('=== Method 1: Complete Protected Request ===\n');

        const response = await solver.completeProtectedRequest(
            CHALLENGE_URL,
            PROTECTED_URL,
            {
                method: 'POST',
                body: JSON.stringify({
                    message: 'Hello from AI agent!',
                    timestamp: new Date().toISOString(),
                }),
            }
        );

        const data = await response.json();
        console.log('Response:', JSON.stringify(data, null, 2));
        console.log('');

        // Method 2: Step by step (more control)
        console.log('=== Method 2: Step-by-Step ===\n');

        // Step 2a: Fetch a challenge
        console.log('Fetching challenge...');
        const challengeResponse = await fetch(CHALLENGE_URL);
        const challengeData = await challengeResponse.json();

        if (!challengeData.success) {
            throw new Error(`Failed to get challenge: ${challengeData.error}`);
        }

        console.log('Challenge received:', {
            id: challengeData.challenge.id,
            type: challengeData.challenge.type,
            difficulty: challengeData.challenge.difficulty,
        });

        // Step 2b: Solve the challenge
        console.log('\nSolving challenge...');
        const solution = solver.solve(challengeData.challenge);

        if (!solution.success) {
            throw new Error(`Failed to solve: ${solution.error}`);
        }

        console.log('Solution found in', solution.solveDuration, 'ms');

        // Step 2c: Make protected request
        console.log('\nMaking protected request...');
        const protectedResponse = await fetch(PROTECTED_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-captchalm-id': challengeData.challenge.id,
                'x-captchalm-solution': solution.solution,
            },
            body: JSON.stringify({
                _CaptchaLMChallenge: challengeData.challenge,
                message: 'Hello from step-by-step method!',
            }),
        });

        const protectedData = await protectedResponse.json();
        console.log('Response:', JSON.stringify(protectedData, null, 2));

    } catch (error) {
        console.error('Error:', error instanceof Error ? error.message : error);
        process.exit(1);
    }

    console.log('\n✅ Demo complete!');
}

// Run if executed directly
main();
