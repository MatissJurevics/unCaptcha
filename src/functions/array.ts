/**
 * Array operation functions for unCaptcha challenges
 */

import type { RegisteredFunction } from '../core/types';

/**
 * Sum all even numbers in an array
 */
export function sumEvens(arr: number[]): number {
    return arr.filter(n => n % 2 === 0).reduce((a, b) => a + b, 0);
}

/**
 * Sum all odd numbers in an array
 */
export function sumOdds(arr: number[]): number {
    return arr.filter(n => n % 2 !== 0).reduce((a, b) => a + b, 0);
}

/**
 * Calculate the product of all elements
 */
export function product(arr: number[]): number {
    return arr.reduce((a, b) => a * b, 1);
}

/**
 * Rotate array by k positions to the right
 */
export function rotateArray(arr: number[], k: number): number[] {
    if (arr.length === 0) return [];
    k = ((k % arr.length) + arr.length) % arr.length;
    return [...arr.slice(-k), ...arr.slice(0, -k)];
}

/**
 * Find the median value
 */
export function findMedian(arr: number[]): number {
    if (arr.length === 0) throw new Error('Cannot find median of empty array');

    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);

    if (sorted.length % 2 === 0) {
        return (sorted[mid - 1] + sorted[mid]) / 2;
    }
    return sorted[mid];
}

/**
 * Find the mode (most frequent element)
 */
export function findMode(arr: number[]): number {
    if (arr.length === 0) throw new Error('Cannot find mode of empty array');

    const counts = new Map<number, number>();
    for (const n of arr) {
        counts.set(n, (counts.get(n) || 0) + 1);
    }

    let maxCount = 0;
    let mode = arr[0];

    for (const [n, count] of counts) {
        if (count > maxCount) {
            maxCount = count;
            mode = n;
        }
    }

    return mode;
}

/**
 * Calculate the range (max - min)
 */
export function range(arr: number[]): number {
    if (arr.length === 0) return 0;
    return Math.max(...arr) - Math.min(...arr);
}

/**
 * Count elements greater than threshold
 */
export function countGreaterThan(arr: number[], threshold: number): number {
    return arr.filter(n => n > threshold).length;
}

/**
 * Count elements less than threshold
 */
export function countLessThan(arr: number[], threshold: number): number {
    return arr.filter(n => n < threshold).length;
}

/**
 * Find second largest element
 */
export function secondLargest(arr: number[]): number {
    if (arr.length < 2) throw new Error('Array must have at least 2 elements');

    const sorted = [...new Set(arr)].sort((a, b) => b - a);
    if (sorted.length < 2) throw new Error('Array must have at least 2 distinct elements');

    return sorted[1];
}

/**
 * Calculate running sum and return the final element
 */
export function runningSum(arr: number[]): number[] {
    const result: number[] = [];
    let sum = 0;

    for (const n of arr) {
        sum += n;
        result.push(sum);
    }

    return result;
}

/**
 * Get element at index with wrapping
 */
export function elementAtWrapped(arr: number[], index: number): number {
    if (arr.length === 0) throw new Error('Array is empty');
    index = ((index % arr.length) + arr.length) % arr.length;
    return arr[index];
}

/**
 * Calculate dot product of two arrays
 */
export function dotProduct(a: number[], b: number[]): number {
    if (a.length !== b.length) throw new Error('Arrays must have equal length');

    let sum = 0;
    for (let i = 0; i < a.length; i++) {
        sum += a[i] * b[i];
    }
    return sum;
}

/**
 * Find index of maximum element
 */
export function maxIndex(arr: number[]): number {
    if (arr.length === 0) throw new Error('Array is empty');

    let maxIdx = 0;
    for (let i = 1; i < arr.length; i++) {
        if (arr[i] > arr[maxIdx]) {
            maxIdx = i;
        }
    }
    return maxIdx;
}

/**
 * Registry of array functions with metadata
 */
export const arrayFunctions: RegisteredFunction[] = [
    {
        name: 'sumEvens',
        fn: sumEvens as (...args: unknown[]) => unknown,
        parameterTypes: ['number[]'],
        description: 'Sum all even numbers in an array',
        difficulty: 'easy',
    },
    {
        name: 'sumOdds',
        fn: sumOdds as (...args: unknown[]) => unknown,
        parameterTypes: ['number[]'],
        description: 'Sum all odd numbers in an array',
        difficulty: 'easy',
    },
    {
        name: 'product',
        fn: product as (...args: unknown[]) => unknown,
        parameterTypes: ['number[]'],
        description: 'Calculate the product of all elements',
        difficulty: 'easy',
    },
    {
        name: 'rotateArray',
        fn: rotateArray as (...args: unknown[]) => unknown,
        parameterTypes: ['number[]', 'number'],
        description: 'Rotate array by k positions to the right',
        difficulty: 'medium',
    },
    {
        name: 'findMedian',
        fn: findMedian as (...args: unknown[]) => unknown,
        parameterTypes: ['number[]'],
        description: 'Find the median value of an array',
        difficulty: 'medium',
    },
    {
        name: 'findMode',
        fn: findMode as (...args: unknown[]) => unknown,
        parameterTypes: ['number[]'],
        description: 'Find the mode (most frequent element)',
        difficulty: 'medium',
    },
    {
        name: 'range',
        fn: range as (...args: unknown[]) => unknown,
        parameterTypes: ['number[]'],
        description: 'Calculate the range (max - min) of an array',
        difficulty: 'easy',
    },
    {
        name: 'countGreaterThan',
        fn: countGreaterThan as (...args: unknown[]) => unknown,
        parameterTypes: ['number[]', 'number'],
        description: 'Count elements greater than a threshold',
        difficulty: 'easy',
    },
    {
        name: 'countLessThan',
        fn: countLessThan as (...args: unknown[]) => unknown,
        parameterTypes: ['number[]', 'number'],
        description: 'Count elements less than a threshold',
        difficulty: 'easy',
    },
    {
        name: 'secondLargest',
        fn: secondLargest as (...args: unknown[]) => unknown,
        parameterTypes: ['number[]'],
        description: 'Find the second largest element',
        difficulty: 'medium',
    },
    {
        name: 'runningSum',
        fn: runningSum as (...args: unknown[]) => unknown,
        parameterTypes: ['number[]'],
        description: 'Calculate running sum array',
        difficulty: 'easy',
    },
    {
        name: 'elementAtWrapped',
        fn: elementAtWrapped as (...args: unknown[]) => unknown,
        parameterTypes: ['number[]', 'number'],
        description: 'Get element at index with wrapping',
        difficulty: 'easy',
    },
    {
        name: 'dotProduct',
        fn: dotProduct as (...args: unknown[]) => unknown,
        parameterTypes: ['number[]', 'number[]'],
        description: 'Calculate dot product of two arrays',
        difficulty: 'medium',
    },
    {
        name: 'maxIndex',
        fn: maxIndex as (...args: unknown[]) => unknown,
        parameterTypes: ['number[]'],
        description: 'Find index of maximum element',
        difficulty: 'easy',
    },
];
