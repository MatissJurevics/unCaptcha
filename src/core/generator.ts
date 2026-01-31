/**
 * Challenge generator for unCaptcha
 */

import type {
    Challenge,
    ChallengeType,
    ChallengeDifficulty,
    ChallengePayload,
    FunctionExecutionPayload,
    ChainedOperationsPayload,
    EncodedInstructionPayload,
    ChainedOperation,
    EncodingType,
    UnCaptchaConfig,
} from './types';
import { encode } from './encoding';
import { generateId, signChallenge, randomInt, randomElement } from '../utils/crypto';
import { getRandomFunction } from '../functions';

/**
 * Default configuration
 */
const DEFAULT_CONFIG: Required<Omit<UnCaptchaConfig, 'secret'>> = {
    difficulty: 'medium',
    challengeTypes: ['function_execution', 'chained_operations', 'encoded_instruction'],
    expirationMs: 30000, // 30 seconds
    rateLimit: {
        maxAttempts: 10,
        windowMs: 60000,
    },
};

/**
 * Challenge generator class
 */
export class ChallengeGenerator {
    private config: Required<UnCaptchaConfig>;

    constructor(config: UnCaptchaConfig) {
        this.config = {
            ...DEFAULT_CONFIG,
            ...config,
        };
    }

    /**
     * Generate a new challenge
     */
    generate(overrides?: Partial<{ type: ChallengeType; difficulty: ChallengeDifficulty }>): {
        challenge: Challenge;
        expectedAnswer: string;
    } {
        const type = overrides?.type ?? randomElement(this.config.challengeTypes);
        const difficulty = overrides?.difficulty ?? this.config.difficulty;

        // Generate payload based on type
        const { payload, expectedAnswer } = this.generatePayload(type, difficulty);

        // Create challenge object
        const id = generateId();
        const expiresAt = Date.now() + this.config.expirationMs;

        // Create signature data
        const signatureData = JSON.stringify({
            id,
            type,
            payload,
            expiresAt,
            expectedAnswer,
        });

        const signature = signChallenge(signatureData, this.config.secret);

        const challenge: Challenge = {
            id,
            type,
            difficulty,
            payload,
            expiresAt,
            signature,
        };

        return { challenge, expectedAnswer };
    }

    /**
     * Generate payload for a specific challenge type
     */
    private generatePayload(
        type: ChallengeType,
        difficulty: ChallengeDifficulty
    ): { payload: ChallengePayload; expectedAnswer: string } {
        switch (type) {
            case 'function_execution':
                return this.generateFunctionExecution(difficulty);
            case 'chained_operations':
                return this.generateChainedOperations(difficulty);
            case 'encoded_instruction':
                return this.generateEncodedInstruction(difficulty);
            case 'pattern_extraction':
                return this.generatePatternExtraction(difficulty);
            case 'code_transform':
                return this.generateCodeTransform(difficulty);
            default:
                throw new Error(`Unknown challenge type: ${type}`);
        }
    }

    /**
     * Generate a function execution challenge
     */
    private generateFunctionExecution(difficulty: ChallengeDifficulty): {
        payload: FunctionExecutionPayload;
        expectedAnswer: string;
    } {
        // Get a random function matching difficulty
        const func = getRandomFunction(difficulty);

        // Generate random parameters based on function
        const parameters = this.generateParameters(func.name, difficulty);

        // Calculate expected result
        const result = func.fn(...parameters);

        // Choose response encoding based on difficulty
        const responseEncoding = this.getResponseEncoding(difficulty);

        // Encode the expected answer
        const expectedAnswer = encode(String(result), responseEncoding);

        // Generate function code string
        const functionCode = this.getFunctionCodeString(func.name);

        const payload: FunctionExecutionPayload = {
            type: 'function_execution',
            functionName: func.name,
            functionCode,
            parameters,
            responseEncoding,
        };

        return { payload, expectedAnswer };
    }

    /**
     * Generate a chained operations challenge
     */
    private generateChainedOperations(difficulty: ChallengeDifficulty): {
        payload: ChainedOperationsPayload;
        expectedAnswer: string;
    } {
        const operationCount = difficulty === 'easy' ? 3 : difficulty === 'medium' ? 5 : 7;
        const initialValue = randomInt(10, 100);

        const operations: ChainedOperation[] = [];
        let currentValue = initialValue;

        const availableOps: ChainedOperation['operation'][] = [
            'add', 'subtract', 'multiply', 'modulo', 'floor', 'abs'
        ];

        if (difficulty === 'hard') {
            availableOps.push('power', 'ceil', 'negate');
        }

        for (let i = 0; i < operationCount; i++) {
            const operation = randomElement(availableOps);
            let value: number | undefined;

            // Generate appropriate value for operation
            switch (operation) {
                case 'add':
                case 'subtract':
                    value = randomInt(1, 50);
                    break;
                case 'multiply':
                    value = randomInt(2, 10);
                    break;
                case 'divide':
                    value = randomInt(2, 5);
                    break;
                case 'modulo':
                    value = randomInt(10, 100);
                    break;
                case 'power':
                    value = randomInt(1, 3);
                    break;
                default:
                    value = undefined;
            }

            operations.push({ operation, value });

            // Calculate running value
            switch (operation) {
                case 'add':
                    currentValue += value!;
                    break;
                case 'subtract':
                    currentValue -= value!;
                    break;
                case 'multiply':
                    currentValue *= value!;
                    break;
                case 'divide':
                    currentValue /= value!;
                    break;
                case 'modulo':
                    currentValue %= value!;
                    break;
                case 'power':
                    currentValue = Math.pow(currentValue, value!);
                    break;
                case 'floor':
                    currentValue = Math.floor(currentValue);
                    break;
                case 'ceil':
                    currentValue = Math.ceil(currentValue);
                    break;
                case 'abs':
                    currentValue = Math.abs(currentValue);
                    break;
                case 'negate':
                    currentValue = -currentValue;
                    break;
            }
        }

        const responseEncoding = this.getResponseEncoding(difficulty);
        const expectedAnswer = encode(String(currentValue), responseEncoding);

        const payload: ChainedOperationsPayload = {
            type: 'chained_operations',
            initialValue,
            operations,
            responseEncoding,
        };

        return { payload, expectedAnswer };
    }

    /**
     * Generate an encoded instruction challenge
     */
    private generateEncodedInstruction(difficulty: ChallengeDifficulty): {
        payload: EncodedInstructionPayload;
        expectedAnswer: string;
    } {
        // Generate a simple instruction
        const a = randomInt(10, 100);
        const b = randomInt(10, 100);
        const operations = ['+', '-', '*'];
        const op = randomElement(operations);

        let result: number;
        switch (op) {
            case '+':
                result = a + b;
                break;
            case '-':
                result = a - b;
                break;
            case '*':
                result = a * b;
                break;
            default:
                result = a + b;
        }

        const instruction = `Calculate: ${a} ${op} ${b}`;

        // Choose encoding based on difficulty
        const instructionEncoding = this.getInstructionEncoding(difficulty);
        const responseEncoding = this.getResponseEncoding(difficulty);

        const encodedInstruction = encode(instruction, instructionEncoding);
        const expectedAnswer = encode(String(result), responseEncoding);

        const payload: EncodedInstructionPayload = {
            type: 'encoded_instruction',
            instruction: encodedInstruction,
            instructionEncoding,
            responseEncoding,
        };

        return { payload, expectedAnswer };
    }

    /**
     * Generate a pattern extraction challenge
     */
    private generatePatternExtraction(difficulty: ChallengeDifficulty): {
        payload: ChallengePayload;
        expectedAnswer: string;
    } {
        // Generate sample data
        const count = difficulty === 'easy' ? 3 : difficulty === 'medium' ? 5 : 7;
        const items: Array<{ id: number; value: number }> = [];

        for (let i = 0; i < count; i++) {
            items.push({
                id: i + 1,
                value: randomInt(10, 100),
            });
        }

        // Generate query
        const queries = [
            { query: 'sum(items[*].value)', fn: (data: typeof items) => data.reduce((s, i) => s + i.value, 0) },
            { query: 'max(items[*].value)', fn: (data: typeof items) => Math.max(...data.map(i => i.value)) },
            { query: 'min(items[*].value)', fn: (data: typeof items) => Math.min(...data.map(i => i.value)) },
            { query: 'count(items)', fn: (data: typeof items) => data.length },
        ];

        const selected = randomElement(queries);
        const result = selected.fn(items);

        const responseEncoding = this.getResponseEncoding(difficulty);
        const expectedAnswer = encode(String(result), responseEncoding);

        return {
            payload: {
                type: 'pattern_extraction',
                data: { items },
                query: selected.query,
                responseEncoding,
            },
            expectedAnswer,
        };
    }

    /**
     * Generate a code transform challenge
     */
    private generateCodeTransform(difficulty: ChallengeDifficulty): {
        payload: ChallengePayload;
        expectedAnswer: string;
    } {
        // Generate simple code to execute
        const a = randomInt(1, 20);
        const b = randomInt(1, 20);
        const code = `const x = ${a}; const y = ${b}; return x + y;`;

        const result = a + b;

        const responseEncoding = this.getResponseEncoding(difficulty);
        const expectedAnswer = encode(String(result), responseEncoding);

        return {
            payload: {
                type: 'code_transform',
                code,
                transform: 'execute',
                responseEncoding,
            },
            expectedAnswer,
        };
    }

    /**
     * Get response encoding based on difficulty
     */
    private getResponseEncoding(difficulty: ChallengeDifficulty): EncodingType {
        switch (difficulty) {
            case 'easy':
                return 'plain';
            case 'medium':
                return randomElement(['plain', 'base64']);
            case 'hard':
                return randomElement(['base64', 'hex']);
        }
    }

    /**
     * Get instruction encoding based on difficulty
     */
    private getInstructionEncoding(difficulty: ChallengeDifficulty): EncodingType {
        switch (difficulty) {
            case 'easy':
                return 'base64';
            case 'medium':
                return randomElement(['base64', 'rot13']);
            case 'hard':
                return randomElement(['hex', 'rot13']);
        }
    }

    /**
     * Generate parameters for a function
     */
    private generateParameters(functionName: string, difficulty: ChallengeDifficulty): unknown[] {
        const range = difficulty === 'easy' ? [1, 20] : difficulty === 'medium' ? [10, 50] : [20, 100];

        // Function-specific parameter generation
        switch (functionName) {
            case 'fibonacci':
                return [randomInt(5, 15)]; // Keep reasonable for performance
            case 'isPrime':
                return [randomInt(range[0], range[1])];
            case 'gcd':
            case 'lcm':
                return [randomInt(range[0], range[1]), randomInt(range[0], range[1])];
            case 'factorial':
                return [randomInt(3, 10)]; // Keep reasonable
            case 'modPow':
                return [randomInt(2, 10), randomInt(2, 8), randomInt(10, 50)];
            case 'digitSum':
            case 'digitCount':
            case 'isPerfectSquare':
            case 'triangular':
                return [randomInt(range[0], range[1])];
            case 'sumOfPrimes':
                return [randomInt(3, 8)]; // Keep reasonable

            // String functions
            case 'reverseWords':
            case 'reverseString':
            case 'countVowels':
            case 'countConsonants':
            case 'removeVowels':
            case 'alternatingCase':
            case 'wordCount':
            case 'longestWord':
            case 'asciiSum':
                return [this.generateRandomWords(difficulty === 'easy' ? 2 : difficulty === 'medium' ? 4 : 6)];
            case 'caesarCipher':
                return [this.generateRandomWords(3), randomInt(1, 25)];
            case 'hammingDistance':
                const word = this.generateRandomWord(5);
                return [word, this.mutateWord(word, 2)];
            case 'countSubstring':
                return ['hello world hello', 'hello'];
            case 'charAtWrapped':
                return ['alphabet', randomInt(0, 20)];

            // Array functions
            case 'sumEvens':
            case 'sumOdds':
            case 'product':
            case 'findMedian':
            case 'findMode':
            case 'range':
            case 'secondLargest':
            case 'runningSum':
            case 'maxIndex':
                return [this.generateRandomArray(difficulty === 'easy' ? 4 : difficulty === 'medium' ? 6 : 8)];
            case 'rotateArray':
                return [this.generateRandomArray(5), randomInt(1, 5)];
            case 'countGreaterThan':
            case 'countLessThan':
                return [this.generateRandomArray(6), randomInt(20, 50)];
            case 'elementAtWrapped':
                return [this.generateRandomArray(5), randomInt(0, 10)];
            case 'dotProduct': {
                const len = difficulty === 'easy' ? 3 : difficulty === 'medium' ? 4 : 5;
                return [this.generateRandomArray(len), this.generateRandomArray(len)];
            }

            // Composite functions
            case 'evaluatePolynomial':
                return [randomInt(1, 5), randomInt(1, 10), randomInt(1, 10), randomInt(1, 5)];
            case 'weightedSum': {
                const wlen = difficulty === 'easy' ? 3 : 4;
                return [this.generateRandomArray(wlen), this.generateRandomArray(wlen)];
            }
            case 'checksum':
                return [this.generateRandomArray(5)];
            case 'computeAndHash':
                return [randomInt(10, 50), randomInt(10, 50), randomInt(10, 50)];

            default:
                return [randomInt(range[0], range[1])];
        }
    }

    /**
     * Generate random words joined by spaces
     */
    private generateRandomWords(count: number): string {
        const words = ['hello', 'world', 'test', 'code', 'data', 'alpha', 'beta', 'gamma'];
        const selected: string[] = [];
        for (let i = 0; i < count; i++) {
            selected.push(randomElement(words));
        }
        return selected.join(' ');
    }

    /**
     * Generate a random word
     */
    private generateRandomWord(length: number): string {
        const chars = 'abcdefghijklmnopqrstuvwxyz';
        let word = '';
        for (let i = 0; i < length; i++) {
            word += chars[randomInt(0, chars.length - 1)];
        }
        return word;
    }

    /**
     * Mutate a word by changing N characters
     */
    private mutateWord(word: string, changes: number): string {
        const chars = word.split('');
        const positions = new Set<number>();

        while (positions.size < Math.min(changes, word.length)) {
            positions.add(randomInt(0, word.length - 1));
        }

        for (const pos of positions) {
            let newChar: string;
            do {
                newChar = 'abcdefghijklmnopqrstuvwxyz'[randomInt(0, 25)];
            } while (newChar === chars[pos]);
            chars[pos] = newChar;
        }

        return chars.join('');
    }

    /**
     * Generate a random array of numbers
     */
    private generateRandomArray(length: number): number[] {
        const arr: number[] = [];
        for (let i = 0; i < length; i++) {
            arr.push(randomInt(1, 50));
        }
        return arr;
    }

    /**
     * Get function code as string (for display)
     */
    private getFunctionCodeString(functionName: string): string {
        // Return a simplified version of the function for the challenge
        const codeMap: Record<string, string> = {
            fibonacci: `function fibonacci(n) {
  if (n <= 1) return n;
  let a = 0, b = 1;
  for (let i = 2; i <= n; i++) {
    const temp = a + b;
    a = b;
    b = temp;
  }
  return b;
}`,
            isPrime: `function isPrime(n) {
  if (n < 2) return false;
  if (n === 2) return true;
  if (n % 2 === 0) return false;
  for (let i = 3; i <= Math.sqrt(n); i += 2) {
    if (n % i === 0) return false;
  }
  return true;
}`,
            gcd: `function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b !== 0) {
    const temp = b;
    b = a % b;
    a = temp;
  }
  return a;
}`,
            digitSum: `function digitSum(n) {
  n = Math.abs(n);
  let sum = 0;
  while (n > 0) {
    sum += n % 10;
    n = Math.floor(n / 10);
  }
  return sum;
}`,
            countVowels: `function countVowels(str) {
  const vowels = 'aeiouAEIOU';
  let count = 0;
  for (const char of str) {
    if (vowels.includes(char)) count++;
  }
  return count;
}`,
            sumEvens: `function sumEvens(arr) {
  return arr.filter(n => n % 2 === 0).reduce((a, b) => a + b, 0);
}`,
        };

        return codeMap[functionName] || `function ${functionName}(...args) { /* implementation */ }`;
    }
}

/**
 * Create a challenge generator
 */
export function createGenerator(config: UnCaptchaConfig): ChallengeGenerator {
    return new ChallengeGenerator(config);
}
