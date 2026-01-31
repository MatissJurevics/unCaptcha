/**
 * Safe code executor for client-side challenge solving
 */

import type {
    ChallengePayload,
    FunctionExecutionPayload,
    ChainedOperationsPayload,
    EncodedInstructionPayload,
    PatternExtractionPayload,
    CodeTransformPayload,
} from '../core/types';
import { decode } from '../core/encoding';

/**
 * Execute a function from code string
 * Uses Function constructor for sandboxed execution
 */
export function executeFunction(code: string, params: unknown[]): unknown {
    try {
        // Create a function from the code
        // The code should define a function, so we wrap it to return the function
        const wrapper = new Function(`
      ${code}
      return ${extractFunctionName(code)};
    `);

        const fn = wrapper();
        return fn(...params);
    } catch (error) {
        throw new Error(`Failed to execute function: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Extract function name from function code
 */
function extractFunctionName(code: string): string {
    const match = code.match(/function\s+(\w+)/);
    if (match) {
        return match[1];
    }
    throw new Error('Could not extract function name from code');
}

/**
 * Execute chained operations
 */
export function executeChainedOperations(
    initialValue: number,
    operations: ChainedOperationsPayload['operations']
): number {
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
                throw new Error(`Unknown operation: ${(op as { operation: string }).operation}`);
        }
    }

    return result;
}

/**
 * Parse and execute encoded instructions
 */
export function executeEncodedInstruction(
    encodedInstruction: string,
    encoding: string
): unknown {
    // Decode the instruction
    const instruction = decode(encodedInstruction, encoding as 'plain' | 'base64' | 'hex' | 'rot13');

    // Parse the instruction
    // Format: "Calculate: A op B"
    const match = instruction.match(/Calculate:\s*(\d+)\s*([+\-*\/])\s*(\d+)/);

    if (!match) {
        throw new Error(`Could not parse instruction: ${instruction}`);
    }

    const a = parseInt(match[1], 10);
    const op = match[2];
    const b = parseInt(match[3], 10);

    switch (op) {
        case '+': return a + b;
        case '-': return a - b;
        case '*': return a * b;
        case '/': return a / b;
        default:
            throw new Error(`Unknown operator: ${op}`);
    }
}

/**
 * Execute pattern extraction query
 */
export function executePatternExtraction(
    data: Record<string, unknown>,
    query: string
): unknown {
    // Simple query parser for common patterns
    // Supports: sum(path), max(path), min(path), count(path), avg(path)

    const funcMatch = query.match(/^(\w+)\(([^)]+)\)$/);
    if (!funcMatch) {
        throw new Error(`Invalid query format: ${query}`);
    }

    const [, func, path] = funcMatch;

    // Extract values from path
    // Supports: items[*].value, items, etc.
    const values = extractPathValues(data, path);

    switch (func.toLowerCase()) {
        case 'sum':
            return (values as number[]).reduce((a, b) => a + b, 0);
        case 'max':
            return Math.max(...(values as number[]));
        case 'min':
            return Math.min(...(values as number[]));
        case 'count':
            return (values as unknown[]).length;
        case 'avg':
            const nums = values as number[];
            return nums.reduce((a, b) => a + b, 0) / nums.length;
        default:
            throw new Error(`Unknown function: ${func}`);
    }
}

/**
 * Extract values from a path expression
 */
function extractPathValues(data: Record<string, unknown>, path: string): unknown[] {
    // Handle array wildcard notation: items[*].value
    const wildcardMatch = path.match(/^(\w+)\[\*\]\.(\w+)$/);

    if (wildcardMatch) {
        const [, arrayName, propName] = wildcardMatch;
        const arr = data[arrayName];

        if (!Array.isArray(arr)) {
            throw new Error(`Expected array at ${arrayName}`);
        }

        return arr.map((item: Record<string, unknown>) => item[propName]);
    }

    // Handle simple path: items
    if (path in data) {
        const value = data[path];
        return Array.isArray(value) ? value : [value];
    }

    throw new Error(`Invalid path: ${path}`);
}

/**
 * Execute code transform
 */
export function executeCodeTransform(
    code: string,
    transform: string
): unknown {
    // Execute the code
    const fn = new Function(code);
    const result = fn();

    switch (transform) {
        case 'execute':
            return result;
        case 'execute_and_base64':
            return Buffer.from(String(result)).toString('base64');
        case 'execute_and_hash':
            // Simple hash for client-side
            const str = String(result);
            let hash = 0;
            for (let i = 0; i < str.length; i++) {
                const char = str.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash;
            }
            return Math.abs(hash).toString(16);
        default:
            throw new Error(`Unknown transform: ${transform}`);
    }
}

/**
 * Execute any challenge payload and return the result
 */
export function executePayload(payload: ChallengePayload): unknown {
    switch (payload.type) {
        case 'function_execution': {
            const p = payload as FunctionExecutionPayload;
            return executeFunction(p.functionCode, p.parameters);
        }
        case 'chained_operations': {
            const p = payload as ChainedOperationsPayload;
            return executeChainedOperations(p.initialValue, p.operations);
        }
        case 'encoded_instruction': {
            const p = payload as EncodedInstructionPayload;
            return executeEncodedInstruction(p.instruction, p.instructionEncoding);
        }
        case 'pattern_extraction': {
            const p = payload as PatternExtractionPayload;
            return executePatternExtraction(p.data, p.query);
        }
        case 'code_transform': {
            const p = payload as CodeTransformPayload;
            return executeCodeTransform(p.code, p.transform);
        }
        default:
            throw new Error(`Unknown challenge type: ${(payload as { type: string }).type}`);
    }
}
