/**
 * String manipulation functions for unCaptcha challenges
 */

import type { RegisteredFunction } from '../core/types';

/**
 * Reverse the order of words in a string
 */
export function reverseWords(str: string): string {
    return str.split(' ').reverse().join(' ');
}

/**
 * Reverse a string character by character
 */
export function reverseString(str: string): string {
    return str.split('').reverse().join('');
}

/**
 * Count vowels in a string
 */
export function countVowels(str: string): number {
    const vowels = 'aeiouAEIOU';
    let count = 0;
    for (const char of str) {
        if (vowels.includes(char)) count++;
    }
    return count;
}

/**
 * Count consonants in a string
 */
export function countConsonants(str: string): number {
    const consonants = 'bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ';
    let count = 0;
    for (const char of str) {
        if (consonants.includes(char)) count++;
    }
    return count;
}

/**
 * Apply Caesar cipher with given shift
 */
export function caesarCipher(str: string, shift: number): string {
    shift = ((shift % 26) + 26) % 26; // Normalize shift

    return str.replace(/[a-zA-Z]/g, (char) => {
        const base = char <= 'Z' ? 65 : 97;
        return String.fromCharCode(((char.charCodeAt(0) - base + shift) % 26) + base);
    });
}

/**
 * Calculate Hamming distance between two strings
 */
export function hammingDistance(a: string, b: string): number {
    if (a.length !== b.length) {
        throw new Error('Strings must be of equal length');
    }

    let distance = 0;
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) distance++;
    }
    return distance;
}

/**
 * Count occurrences of a substring
 */
export function countSubstring(str: string, sub: string): number {
    if (sub.length === 0) return 0;

    let count = 0;
    let pos = 0;

    while ((pos = str.indexOf(sub, pos)) !== -1) {
        count++;
        pos += 1;
    }

    return count;
}

/**
 * Get character at index (with wrapping)
 */
export function charAtWrapped(str: string, index: number): string {
    if (str.length === 0) return '';
    index = ((index % str.length) + str.length) % str.length;
    return str[index];
}

/**
 * Calculate the sum of ASCII values
 */
export function asciiSum(str: string): number {
    let sum = 0;
    for (const char of str) {
        sum += char.charCodeAt(0);
    }
    return sum;
}

/**
 * Remove all vowels from a string
 */
export function removeVowels(str: string): string {
    return str.replace(/[aeiouAEIOU]/g, '');
}

/**
 * Convert to alternating case
 */
export function alternatingCase(str: string): string {
    return str
        .split('')
        .map((char, i) => (i % 2 === 0 ? char.toLowerCase() : char.toUpperCase()))
        .join('');
}

/**
 * Count words in a string
 */
export function wordCount(str: string): number {
    return str.trim().split(/\s+/).filter(w => w.length > 0).length;
}

/**
 * Get the longest word in a string
 */
export function longestWord(str: string): string {
    const words = str.split(/\s+/).filter(w => w.length > 0);
    if (words.length === 0) return '';
    return words.reduce((a, b) => (a.length >= b.length ? a : b));
}

/**
 * Registry of string functions with metadata
 */
export const stringFunctions: RegisteredFunction[] = [
    {
        name: 'reverseWords',
        fn: reverseWords as (...args: unknown[]) => unknown,
        parameterTypes: ['string'],
        description: 'Reverse the order of words in a string',
        difficulty: 'easy',
    },
    {
        name: 'reverseString',
        fn: reverseString as (...args: unknown[]) => unknown,
        parameterTypes: ['string'],
        description: 'Reverse a string character by character',
        difficulty: 'easy',
    },
    {
        name: 'countVowels',
        fn: countVowels as (...args: unknown[]) => unknown,
        parameterTypes: ['string'],
        description: 'Count the number of vowels in a string',
        difficulty: 'easy',
    },
    {
        name: 'countConsonants',
        fn: countConsonants as (...args: unknown[]) => unknown,
        parameterTypes: ['string'],
        description: 'Count the number of consonants in a string',
        difficulty: 'easy',
    },
    {
        name: 'caesarCipher',
        fn: caesarCipher as (...args: unknown[]) => unknown,
        parameterTypes: ['string', 'number'],
        description: 'Apply Caesar cipher with given shift',
        difficulty: 'medium',
    },
    {
        name: 'hammingDistance',
        fn: hammingDistance as (...args: unknown[]) => unknown,
        parameterTypes: ['string', 'string'],
        description: 'Calculate Hamming distance between two equal-length strings',
        difficulty: 'medium',
    },
    {
        name: 'countSubstring',
        fn: countSubstring as (...args: unknown[]) => unknown,
        parameterTypes: ['string', 'string'],
        description: 'Count occurrences of a substring',
        difficulty: 'easy',
    },
    {
        name: 'charAtWrapped',
        fn: charAtWrapped as (...args: unknown[]) => unknown,
        parameterTypes: ['string', 'number'],
        description: 'Get character at index with wrapping',
        difficulty: 'easy',
    },
    {
        name: 'asciiSum',
        fn: asciiSum as (...args: unknown[]) => unknown,
        parameterTypes: ['string'],
        description: 'Calculate sum of ASCII values of all characters',
        difficulty: 'medium',
    },
    {
        name: 'removeVowels',
        fn: removeVowels as (...args: unknown[]) => unknown,
        parameterTypes: ['string'],
        description: 'Remove all vowels from a string',
        difficulty: 'easy',
    },
    {
        name: 'alternatingCase',
        fn: alternatingCase as (...args: unknown[]) => unknown,
        parameterTypes: ['string'],
        description: 'Convert to alternating case',
        difficulty: 'easy',
    },
    {
        name: 'wordCount',
        fn: wordCount as (...args: unknown[]) => unknown,
        parameterTypes: ['string'],
        description: 'Count words in a string',
        difficulty: 'easy',
    },
    {
        name: 'longestWord',
        fn: longestWord as (...args: unknown[]) => unknown,
        parameterTypes: ['string'],
        description: 'Get the longest word in a string',
        difficulty: 'easy',
    },
];
