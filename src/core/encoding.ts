/**
 * Encoding utilities for unCaptcha challenges
 */

import type { EncodingType } from './types';

/**
 * Encode a value using the specified encoding
 */
export function encode(value: string, encoding: EncodingType): string {
    switch (encoding) {
        case 'plain':
            return value;
        case 'base64':
            return encodeBase64(value);
        case 'hex':
            return encodeHex(value);
        case 'rot13':
            return encodeRot13(value);
        default:
            throw new Error(`Unknown encoding type: ${encoding}`);
    }
}

/**
 * Decode a value using the specified encoding
 */
export function decode(value: string, encoding: EncodingType): string {
    switch (encoding) {
        case 'plain':
            return value;
        case 'base64':
            return decodeBase64(value);
        case 'hex':
            return decodeHex(value);
        case 'rot13':
            return decodeRot13(value); // ROT13 is symmetric
        default:
            throw new Error(`Unknown encoding type: ${encoding}`);
    }
}

/**
 * Base64 encode a string
 */
export function encodeBase64(value: string): string {
    return Buffer.from(value, 'utf-8').toString('base64');
}

/**
 * Base64 decode a string
 */
export function decodeBase64(value: string): string {
    return Buffer.from(value, 'base64').toString('utf-8');
}

/**
 * Hex encode a string
 */
export function encodeHex(value: string): string {
    return Buffer.from(value, 'utf-8').toString('hex');
}

/**
 * Hex decode a string
 */
export function decodeHex(value: string): string {
    return Buffer.from(value, 'hex').toString('utf-8');
}

/**
 * ROT13 encode/decode a string (symmetric cipher)
 */
export function encodeRot13(value: string): string {
    return value.replace(/[a-zA-Z]/g, (char) => {
        const base = char <= 'Z' ? 65 : 97;
        return String.fromCharCode(((char.charCodeAt(0) - base + 13) % 26) + base);
    });
}

/**
 * ROT13 decode (same as encode, symmetric)
 */
export function decodeRot13(value: string): string {
    return encodeRot13(value);
}

/**
 * Apply multiple encoding layers
 */
export function encodeChain(value: string, encodings: EncodingType[]): string {
    return encodings.reduce((acc, encoding) => encode(acc, encoding), value);
}

/**
 * Decode multiple encoding layers (in reverse order)
 */
export function decodeChain(value: string, encodings: EncodingType[]): string {
    return [...encodings].reverse().reduce((acc, encoding) => decode(acc, encoding), value);
}
