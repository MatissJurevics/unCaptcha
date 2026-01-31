/**
 * Mathematical functions for CaptchaLM challenges
 */

import type { RegisteredFunction } from '../core/types';

/**
 * Calculate the nth Fibonacci number
 */
export function fibonacci(n: number): number {
    if (n < 0) throw new Error('Fibonacci not defined for negative numbers');
    if (n <= 1) return n;

    let a = 0, b = 1;
    for (let i = 2; i <= n; i++) {
        const temp = a + b;
        a = b;
        b = temp;
    }
    return b;
}

/**
 * Check if a number is prime
 */
export function isPrime(n: number): boolean {
    if (n < 2) return false;
    if (n === 2) return true;
    if (n % 2 === 0) return false;

    for (let i = 3; i <= Math.sqrt(n); i += 2) {
        if (n % i === 0) return false;
    }
    return true;
}

/**
 * Calculate greatest common divisor
 */
export function gcd(a: number, b: number): number {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b !== 0) {
        const temp = b;
        b = a % b;
        a = temp;
    }
    return a;
}

/**
 * Calculate least common multiple
 */
export function lcm(a: number, b: number): number {
    return Math.abs(a * b) / gcd(a, b);
}

/**
 * Calculate factorial
 */
export function factorial(n: number): number {
    if (n < 0) throw new Error('Factorial not defined for negative numbers');
    if (n <= 1) return 1;

    let result = 1;
    for (let i = 2; i <= n; i++) {
        result *= i;
    }
    return result;
}

/**
 * Modular exponentiation (base^exp mod mod)
 */
export function modPow(base: number, exp: number, mod: number): number {
    if (mod === 1) return 0;

    let result = 1;
    base = base % mod;

    while (exp > 0) {
        if (exp % 2 === 1) {
            result = (result * base) % mod;
        }
        exp = Math.floor(exp / 2);
        base = (base * base) % mod;
    }

    return result;
}

/**
 * Sum of digits
 */
export function digitSum(n: number): number {
    n = Math.abs(n);
    let sum = 0;
    while (n > 0) {
        sum += n % 10;
        n = Math.floor(n / 10);
    }
    return sum;
}

/**
 * Count digits in a number
 */
export function digitCount(n: number): number {
    if (n === 0) return 1;
    return Math.floor(Math.log10(Math.abs(n))) + 1;
}

/**
 * Check if a number is a perfect square
 */
export function isPerfectSquare(n: number): boolean {
    if (n < 0) return false;
    const sqrt = Math.sqrt(n);
    return sqrt === Math.floor(sqrt);
}

/**
 * Calculate the nth triangular number
 */
export function triangular(n: number): number {
    return (n * (n + 1)) / 2;
}

/**
 * Calculate sum of first n primes
 */
export function sumOfPrimes(n: number): number {
    let count = 0;
    let sum = 0;
    let num = 2;

    while (count < n) {
        if (isPrime(num)) {
            sum += num;
            count++;
        }
        num++;
    }

    return sum;
}

/**
 * Registry of math functions with metadata
 */
export const mathFunctions: RegisteredFunction[] = [
    {
        name: 'fibonacci',
        fn: fibonacci as (...args: unknown[]) => unknown,
        parameterTypes: ['number'],
        description: 'Calculate the nth Fibonacci number',
        difficulty: 'easy',
    },
    {
        name: 'isPrime',
        fn: isPrime as (...args: unknown[]) => unknown,
        parameterTypes: ['number'],
        description: 'Check if a number is prime',
        difficulty: 'easy',
    },
    {
        name: 'gcd',
        fn: gcd as (...args: unknown[]) => unknown,
        parameterTypes: ['number', 'number'],
        description: 'Calculate greatest common divisor of two numbers',
        difficulty: 'easy',
    },
    {
        name: 'lcm',
        fn: lcm as (...args: unknown[]) => unknown,
        parameterTypes: ['number', 'number'],
        description: 'Calculate least common multiple of two numbers',
        difficulty: 'medium',
    },
    {
        name: 'factorial',
        fn: factorial as (...args: unknown[]) => unknown,
        parameterTypes: ['number'],
        description: 'Calculate factorial of a number',
        difficulty: 'easy',
    },
    {
        name: 'modPow',
        fn: modPow as (...args: unknown[]) => unknown,
        parameterTypes: ['number', 'number', 'number'],
        description: 'Calculate modular exponentiation (base^exp mod mod)',
        difficulty: 'hard',
    },
    {
        name: 'digitSum',
        fn: digitSum as (...args: unknown[]) => unknown,
        parameterTypes: ['number'],
        description: 'Calculate sum of digits in a number',
        difficulty: 'easy',
    },
    {
        name: 'digitCount',
        fn: digitCount as (...args: unknown[]) => unknown,
        parameterTypes: ['number'],
        description: 'Count the number of digits',
        difficulty: 'easy',
    },
    {
        name: 'isPerfectSquare',
        fn: isPerfectSquare as (...args: unknown[]) => unknown,
        parameterTypes: ['number'],
        description: 'Check if a number is a perfect square',
        difficulty: 'easy',
    },
    {
        name: 'triangular',
        fn: triangular as (...args: unknown[]) => unknown,
        parameterTypes: ['number'],
        description: 'Calculate the nth triangular number',
        difficulty: 'easy',
    },
    {
        name: 'sumOfPrimes',
        fn: sumOfPrimes as (...args: unknown[]) => unknown,
        parameterTypes: ['number'],
        description: 'Calculate sum of first n prime numbers',
        difficulty: 'hard',
    },
];
