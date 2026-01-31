/**
 * Cryptographic utilities for unCaptcha
 */

import { createHmac, randomBytes, timingSafeEqual } from 'crypto';

/**
 * Generate a cryptographically secure random ID
 */
export function generateId(length: number = 32): string {
    return randomBytes(length).toString('hex');
}

/**
 * Create an HMAC signature for a challenge
 */
export function signChallenge(data: string, secret: string): string {
    return createHmac('sha256', secret)
        .update(data)
        .digest('hex');
}

/**
 * Verify an HMAC signature
 */
export function verifySignature(data: string, signature: string, secret: string): boolean {
    const expected = signChallenge(data, secret);

    // Use timing-safe comparison to prevent timing attacks
    try {
        return timingSafeEqual(
            Buffer.from(signature, 'hex'),
            Buffer.from(expected, 'hex')
        );
    } catch {
        return false;
    }
}

/**
 * Hash a string using SHA-256
 */
export function sha256(data: string): string {
    return createHmac('sha256', '')
        .update(data)
        .digest('hex');
}

/**
 * Generate a simple hash for encoding purposes (first N characters of SHA-256)
 */
export function shortHash(data: string, length: number = 8): string {
    return sha256(data).substring(0, length);
}

/**
 * Constant-time string comparison
 */
export function safeCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
        return false;
    }

    try {
        return timingSafeEqual(Buffer.from(a), Buffer.from(b));
    } catch {
        return false;
    }
}

/**
 * Generate a random number within a range
 */
export function randomInt(min: number, max: number): number {
    const range = max - min + 1;
    const bytesNeeded = Math.ceil(Math.log2(range) / 8) || 1;
    const maxValid = Math.floor(256 ** bytesNeeded / range) * range - 1;

    let randomValue: number;
    do {
        const bytes = randomBytes(bytesNeeded);
        randomValue = bytes.reduce((acc, byte, i) => acc + byte * (256 ** i), 0);
    } while (randomValue > maxValid);

    return min + (randomValue % range);
}

/**
 * Select a random element from an array
 */
export function randomElement<T>(arr: T[]): T {
    if (arr.length === 0) {
        throw new Error('Cannot select from empty array');
    }
    return arr[randomInt(0, arr.length - 1)];
}

/**
 * Shuffle an array using Fisher-Yates algorithm
 */
export function shuffle<T>(arr: T[]): T[] {
    const result = [...arr];
    for (let i = result.length - 1; i > 0; i--) {
        const j = randomInt(0, i);
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}
