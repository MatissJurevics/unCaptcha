/**
 * Function registry for unCaptcha challenges
 */

import type { RegisteredFunction, ChallengeDifficulty } from '../core/types';
import { mathFunctions } from './math';
import { stringFunctions } from './string';
import { arrayFunctions } from './array';
import { compositeFunctions } from './composite';

// Export all function modules
export * from './math';
export * from './string';
export * from './array';
export * from './composite';

/**
 * Combined registry of all available functions
 */
export const allFunctions: RegisteredFunction[] = [
    ...mathFunctions,
    ...stringFunctions,
    ...arrayFunctions,
    ...compositeFunctions,
];

/**
 * Get functions filtered by difficulty
 */
export function getFunctionsByDifficulty(difficulty: ChallengeDifficulty): RegisteredFunction[] {
    return allFunctions.filter(f => f.difficulty === difficulty);
}

/**
 * Get a function by name
 */
export function getFunctionByName(name: string): RegisteredFunction | undefined {
    return allFunctions.find(f => f.name === name);
}

/**
 * Get a random function matching the difficulty
 */
export function getRandomFunction(difficulty?: ChallengeDifficulty): RegisteredFunction {
    const pool = difficulty ? getFunctionsByDifficulty(difficulty) : allFunctions;

    if (pool.length === 0) {
        throw new Error(`No functions available for difficulty: ${difficulty}`);
    }

    const index = Math.floor(Math.random() * pool.length);
    return pool[index];
}

/**
 * Function categories for organization
 */
export const functionCategories = {
    math: mathFunctions,
    string: stringFunctions,
    array: arrayFunctions,
    composite: compositeFunctions,
} as const;

export type FunctionCategory = keyof typeof functionCategories;

/**
 * Get functions by category
 */
export function getFunctionsByCategory(category: FunctionCategory): RegisteredFunction[] {
    return functionCategories[category];
}
