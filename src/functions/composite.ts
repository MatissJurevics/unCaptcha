/**
 * Composite/chained functions for unCaptcha challenges
 */

import type { RegisteredFunction, ChainedOperation } from '../core/types';

/**
 * Apply a chain of operations to a value
 */
export function applyChainedOperations(initialValue: number, operations: ChainedOperation[]): number {
    let result = initialValue;

    for (const op of operations) {
        switch (op.operation) {
            case 'add':
                result += op.value ?? 0;
                break;
            case 'subtract':
                result -= op.value ?? 0;
                break;
            case 'multiply':
                result *= op.value ?? 1;
                break;
            case 'divide':
                if (op.value === 0) throw new Error('Division by zero');
                result /= op.value ?? 1;
                break;
            case 'modulo':
                if (op.value === 0) throw new Error('Modulo by zero');
                result %= op.value ?? 1;
                break;
            case 'power':
                result = Math.pow(result, op.value ?? 1);
                break;
            case 'floor':
                result = Math.floor(result);
                break;
            case 'ceil':
                result = Math.ceil(result);
                break;
            case 'abs':
                result = Math.abs(result);
                break;
            case 'negate':
                result = -result;
                break;
            default:
                throw new Error(`Unknown operation: ${(op as ChainedOperation).operation}`);
        }
    }

    return result;
}

/**
 * Apply multiple math operations and return hash of result
 */
export function computeAndHash(a: number, b: number, c: number): string {
    // Perform a series of operations
    const step1 = a * b;
    const step2 = step1 + c;
    const step3 = step2 % 1000;
    const step4 = step3 * (a % 10);

    // Convert to hex string
    return Math.abs(step4).toString(16).padStart(4, '0');
}

/**
 * Compute polynomial evaluation: a*x^2 + b*x + c
 */
export function evaluatePolynomial(a: number, b: number, c: number, x: number): number {
    return a * x * x + b * x + c;
}

/**
 * Compute weighted sum: sum(values[i] * weights[i])
 */
export function weightedSum(values: number[], weights: number[]): number {
    if (values.length !== weights.length) {
        throw new Error('Values and weights must have same length');
    }

    let sum = 0;
    for (let i = 0; i < values.length; i++) {
        sum += values[i] * weights[i];
    }
    return sum;
}

/**
 * Compute a simple checksum from multiple values
 */
export function checksum(values: number[]): number {
    let result = 0;
    for (let i = 0; i < values.length; i++) {
        result = ((result << 5) - result + values[i]) | 0;
    }
    return Math.abs(result);
}

/**
 * Compute the result of a nested expression
 * Format: [op, operand1, operand2] where operands can be numbers or nested expressions
 */
export function evaluateExpression(expr: unknown): number {
    if (typeof expr === 'number') {
        return expr;
    }

    if (!Array.isArray(expr) || expr.length !== 3) {
        throw new Error('Invalid expression format');
    }

    const [op, left, right] = expr;
    const leftVal = evaluateExpression(left);
    const rightVal = evaluateExpression(right);

    switch (op) {
        case '+': return leftVal + rightVal;
        case '-': return leftVal - rightVal;
        case '*': return leftVal * rightVal;
        case '/':
            if (rightVal === 0) throw new Error('Division by zero');
            return leftVal / rightVal;
        case '%':
            if (rightVal === 0) throw new Error('Modulo by zero');
            return leftVal % rightVal;
        case '^': return Math.pow(leftVal, rightVal);
        default:
            throw new Error(`Unknown operator: ${op}`);
    }
}

/**
 * Registry of composite functions with metadata
 */
export const compositeFunctions: RegisteredFunction[] = [
    {
        name: 'applyChainedOperations',
        fn: applyChainedOperations as (...args: unknown[]) => unknown,
        parameterTypes: ['number', 'ChainedOperation[]'],
        description: 'Apply a chain of arithmetic operations to a value',
        difficulty: 'medium',
    },
    {
        name: 'computeAndHash',
        fn: computeAndHash as (...args: unknown[]) => unknown,
        parameterTypes: ['number', 'number', 'number'],
        description: 'Compute operations and return hex hash',
        difficulty: 'hard',
    },
    {
        name: 'evaluatePolynomial',
        fn: evaluatePolynomial as (...args: unknown[]) => unknown,
        parameterTypes: ['number', 'number', 'number', 'number'],
        description: 'Evaluate polynomial a*x^2 + b*x + c',
        difficulty: 'medium',
    },
    {
        name: 'weightedSum',
        fn: weightedSum as (...args: unknown[]) => unknown,
        parameterTypes: ['number[]', 'number[]'],
        description: 'Compute weighted sum of two arrays',
        difficulty: 'medium',
    },
    {
        name: 'checksum',
        fn: checksum as (...args: unknown[]) => unknown,
        parameterTypes: ['number[]'],
        description: 'Compute a simple checksum from values',
        difficulty: 'medium',
    },
    {
        name: 'evaluateExpression',
        fn: evaluateExpression as (...args: unknown[]) => unknown,
        parameterTypes: ['expression'],
        description: 'Evaluate a nested arithmetic expression',
        difficulty: 'hard',
    },
];
