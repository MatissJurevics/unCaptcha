import { randomBytes, createHmac, timingSafeEqual } from 'crypto';

// src/core/encoding.ts
function encode(value, encoding) {
  switch (encoding) {
    case "plain":
      return value;
    case "base64":
      return encodeBase64(value);
    case "hex":
      return encodeHex(value);
    case "rot13":
      return encodeRot13(value);
    default:
      throw new Error(`Unknown encoding type: ${encoding}`);
  }
}
function decode(value, encoding) {
  switch (encoding) {
    case "plain":
      return value;
    case "base64":
      return decodeBase64(value);
    case "hex":
      return decodeHex(value);
    case "rot13":
      return decodeRot13(value);
    // ROT13 is symmetric
    default:
      throw new Error(`Unknown encoding type: ${encoding}`);
  }
}
function encodeBase64(value) {
  return Buffer.from(value, "utf-8").toString("base64");
}
function decodeBase64(value) {
  return Buffer.from(value, "base64").toString("utf-8");
}
function encodeHex(value) {
  return Buffer.from(value, "utf-8").toString("hex");
}
function decodeHex(value) {
  return Buffer.from(value, "hex").toString("utf-8");
}
function encodeRot13(value) {
  return value.replace(/[a-zA-Z]/g, (char) => {
    const base = char <= "Z" ? 65 : 97;
    return String.fromCharCode((char.charCodeAt(0) - base + 13) % 26 + base);
  });
}
function decodeRot13(value) {
  return encodeRot13(value);
}
function encodeChain(value, encodings) {
  return encodings.reduce((acc, encoding) => encode(acc, encoding), value);
}
function decodeChain(value, encodings) {
  return [...encodings].reverse().reduce((acc, encoding) => decode(acc, encoding), value);
}
function generateId(length = 32) {
  return randomBytes(length).toString("hex");
}
function signChallenge(data, secret) {
  return createHmac("sha256", secret).update(data).digest("hex");
}
function safeCompare(a, b) {
  if (a.length !== b.length) {
    return false;
  }
  try {
    return timingSafeEqual(Buffer.from(a), Buffer.from(b));
  } catch {
    return false;
  }
}
function randomInt(min, max) {
  const range2 = max - min + 1;
  const bytesNeeded = Math.ceil(Math.log2(range2) / 8) || 1;
  const maxValid = Math.floor(256 ** bytesNeeded / range2) * range2 - 1;
  let randomValue;
  do {
    const bytes = randomBytes(bytesNeeded);
    randomValue = bytes.reduce((acc, byte, i) => acc + byte * 256 ** i, 0);
  } while (randomValue > maxValid);
  return min + randomValue % range2;
}
function randomElement(arr) {
  if (arr.length === 0) {
    throw new Error("Cannot select from empty array");
  }
  return arr[randomInt(0, arr.length - 1)];
}

// src/functions/math.ts
function fibonacci(n) {
  if (n < 0) throw new Error("Fibonacci not defined for negative numbers");
  if (n <= 1) return n;
  let a = 0, b = 1;
  for (let i = 2; i <= n; i++) {
    const temp = a + b;
    a = b;
    b = temp;
  }
  return b;
}
function isPrime(n) {
  if (n < 2) return false;
  if (n === 2) return true;
  if (n % 2 === 0) return false;
  for (let i = 3; i <= Math.sqrt(n); i += 2) {
    if (n % i === 0) return false;
  }
  return true;
}
function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b !== 0) {
    const temp = b;
    b = a % b;
    a = temp;
  }
  return a;
}
function lcm(a, b) {
  return Math.abs(a * b) / gcd(a, b);
}
function factorial(n) {
  if (n < 0) throw new Error("Factorial not defined for negative numbers");
  if (n <= 1) return 1;
  let result = 1;
  for (let i = 2; i <= n; i++) {
    result *= i;
  }
  return result;
}
function modPow(base, exp, mod) {
  if (mod === 1) return 0;
  let result = 1;
  base = base % mod;
  while (exp > 0) {
    if (exp % 2 === 1) {
      result = result * base % mod;
    }
    exp = Math.floor(exp / 2);
    base = base * base % mod;
  }
  return result;
}
function digitSum(n) {
  n = Math.abs(n);
  let sum = 0;
  while (n > 0) {
    sum += n % 10;
    n = Math.floor(n / 10);
  }
  return sum;
}
function digitCount(n) {
  if (n === 0) return 1;
  return Math.floor(Math.log10(Math.abs(n))) + 1;
}
function isPerfectSquare(n) {
  if (n < 0) return false;
  const sqrt = Math.sqrt(n);
  return sqrt === Math.floor(sqrt);
}
function triangular(n) {
  return n * (n + 1) / 2;
}
function sumOfPrimes(n) {
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
var mathFunctions = [
  {
    name: "fibonacci",
    fn: fibonacci,
    parameterTypes: ["number"],
    description: "Calculate the nth Fibonacci number",
    difficulty: "easy"
  },
  {
    name: "isPrime",
    fn: isPrime,
    parameterTypes: ["number"],
    description: "Check if a number is prime",
    difficulty: "easy"
  },
  {
    name: "gcd",
    fn: gcd,
    parameterTypes: ["number", "number"],
    description: "Calculate greatest common divisor of two numbers",
    difficulty: "easy"
  },
  {
    name: "lcm",
    fn: lcm,
    parameterTypes: ["number", "number"],
    description: "Calculate least common multiple of two numbers",
    difficulty: "medium"
  },
  {
    name: "factorial",
    fn: factorial,
    parameterTypes: ["number"],
    description: "Calculate factorial of a number",
    difficulty: "easy"
  },
  {
    name: "modPow",
    fn: modPow,
    parameterTypes: ["number", "number", "number"],
    description: "Calculate modular exponentiation (base^exp mod mod)",
    difficulty: "hard"
  },
  {
    name: "digitSum",
    fn: digitSum,
    parameterTypes: ["number"],
    description: "Calculate sum of digits in a number",
    difficulty: "easy"
  },
  {
    name: "digitCount",
    fn: digitCount,
    parameterTypes: ["number"],
    description: "Count the number of digits",
    difficulty: "easy"
  },
  {
    name: "isPerfectSquare",
    fn: isPerfectSquare,
    parameterTypes: ["number"],
    description: "Check if a number is a perfect square",
    difficulty: "easy"
  },
  {
    name: "triangular",
    fn: triangular,
    parameterTypes: ["number"],
    description: "Calculate the nth triangular number",
    difficulty: "easy"
  },
  {
    name: "sumOfPrimes",
    fn: sumOfPrimes,
    parameterTypes: ["number"],
    description: "Calculate sum of first n prime numbers",
    difficulty: "hard"
  }
];

// src/functions/string.ts
function reverseWords(str) {
  return str.split(" ").reverse().join(" ");
}
function reverseString(str) {
  return str.split("").reverse().join("");
}
function countVowels(str) {
  const vowels = "aeiouAEIOU";
  let count = 0;
  for (const char of str) {
    if (vowels.includes(char)) count++;
  }
  return count;
}
function countConsonants(str) {
  const consonants = "bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ";
  let count = 0;
  for (const char of str) {
    if (consonants.includes(char)) count++;
  }
  return count;
}
function caesarCipher(str, shift) {
  shift = (shift % 26 + 26) % 26;
  return str.replace(/[a-zA-Z]/g, (char) => {
    const base = char <= "Z" ? 65 : 97;
    return String.fromCharCode((char.charCodeAt(0) - base + shift) % 26 + base);
  });
}
function hammingDistance(a, b) {
  if (a.length !== b.length) {
    throw new Error("Strings must be of equal length");
  }
  let distance = 0;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) distance++;
  }
  return distance;
}
function countSubstring(str, sub) {
  if (sub.length === 0) return 0;
  let count = 0;
  let pos = 0;
  while ((pos = str.indexOf(sub, pos)) !== -1) {
    count++;
    pos += 1;
  }
  return count;
}
function charAtWrapped(str, index) {
  if (str.length === 0) return "";
  index = (index % str.length + str.length) % str.length;
  return str[index];
}
function asciiSum(str) {
  let sum = 0;
  for (const char of str) {
    sum += char.charCodeAt(0);
  }
  return sum;
}
function removeVowels(str) {
  return str.replace(/[aeiouAEIOU]/g, "");
}
function alternatingCase(str) {
  return str.split("").map((char, i) => i % 2 === 0 ? char.toLowerCase() : char.toUpperCase()).join("");
}
function wordCount(str) {
  return str.trim().split(/\s+/).filter((w) => w.length > 0).length;
}
function longestWord(str) {
  const words = str.split(/\s+/).filter((w) => w.length > 0);
  if (words.length === 0) return "";
  return words.reduce((a, b) => a.length >= b.length ? a : b);
}
var stringFunctions = [
  {
    name: "reverseWords",
    fn: reverseWords,
    parameterTypes: ["string"],
    description: "Reverse the order of words in a string",
    difficulty: "easy"
  },
  {
    name: "reverseString",
    fn: reverseString,
    parameterTypes: ["string"],
    description: "Reverse a string character by character",
    difficulty: "easy"
  },
  {
    name: "countVowels",
    fn: countVowels,
    parameterTypes: ["string"],
    description: "Count the number of vowels in a string",
    difficulty: "easy"
  },
  {
    name: "countConsonants",
    fn: countConsonants,
    parameterTypes: ["string"],
    description: "Count the number of consonants in a string",
    difficulty: "easy"
  },
  {
    name: "caesarCipher",
    fn: caesarCipher,
    parameterTypes: ["string", "number"],
    description: "Apply Caesar cipher with given shift",
    difficulty: "medium"
  },
  {
    name: "hammingDistance",
    fn: hammingDistance,
    parameterTypes: ["string", "string"],
    description: "Calculate Hamming distance between two equal-length strings",
    difficulty: "medium"
  },
  {
    name: "countSubstring",
    fn: countSubstring,
    parameterTypes: ["string", "string"],
    description: "Count occurrences of a substring",
    difficulty: "easy"
  },
  {
    name: "charAtWrapped",
    fn: charAtWrapped,
    parameterTypes: ["string", "number"],
    description: "Get character at index with wrapping",
    difficulty: "easy"
  },
  {
    name: "asciiSum",
    fn: asciiSum,
    parameterTypes: ["string"],
    description: "Calculate sum of ASCII values of all characters",
    difficulty: "medium"
  },
  {
    name: "removeVowels",
    fn: removeVowels,
    parameterTypes: ["string"],
    description: "Remove all vowels from a string",
    difficulty: "easy"
  },
  {
    name: "alternatingCase",
    fn: alternatingCase,
    parameterTypes: ["string"],
    description: "Convert to alternating case",
    difficulty: "easy"
  },
  {
    name: "wordCount",
    fn: wordCount,
    parameterTypes: ["string"],
    description: "Count words in a string",
    difficulty: "easy"
  },
  {
    name: "longestWord",
    fn: longestWord,
    parameterTypes: ["string"],
    description: "Get the longest word in a string",
    difficulty: "easy"
  }
];

// src/functions/array.ts
function sumEvens(arr) {
  return arr.filter((n) => n % 2 === 0).reduce((a, b) => a + b, 0);
}
function sumOdds(arr) {
  return arr.filter((n) => n % 2 !== 0).reduce((a, b) => a + b, 0);
}
function product(arr) {
  return arr.reduce((a, b) => a * b, 1);
}
function rotateArray(arr, k) {
  if (arr.length === 0) return [];
  k = (k % arr.length + arr.length) % arr.length;
  return [...arr.slice(-k), ...arr.slice(0, -k)];
}
function findMedian(arr) {
  if (arr.length === 0) throw new Error("Cannot find median of empty array");
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
}
function findMode(arr) {
  if (arr.length === 0) throw new Error("Cannot find mode of empty array");
  const counts = /* @__PURE__ */ new Map();
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
function range(arr) {
  if (arr.length === 0) return 0;
  return Math.max(...arr) - Math.min(...arr);
}
function countGreaterThan(arr, threshold) {
  return arr.filter((n) => n > threshold).length;
}
function countLessThan(arr, threshold) {
  return arr.filter((n) => n < threshold).length;
}
function secondLargest(arr) {
  if (arr.length < 2) throw new Error("Array must have at least 2 elements");
  const sorted = [...new Set(arr)].sort((a, b) => b - a);
  if (sorted.length < 2) throw new Error("Array must have at least 2 distinct elements");
  return sorted[1];
}
function runningSum(arr) {
  const result = [];
  let sum = 0;
  for (const n of arr) {
    sum += n;
    result.push(sum);
  }
  return result;
}
function elementAtWrapped(arr, index) {
  if (arr.length === 0) throw new Error("Array is empty");
  index = (index % arr.length + arr.length) % arr.length;
  return arr[index];
}
function dotProduct(a, b) {
  if (a.length !== b.length) throw new Error("Arrays must have equal length");
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += a[i] * b[i];
  }
  return sum;
}
function maxIndex(arr) {
  if (arr.length === 0) throw new Error("Array is empty");
  let maxIdx = 0;
  for (let i = 1; i < arr.length; i++) {
    if (arr[i] > arr[maxIdx]) {
      maxIdx = i;
    }
  }
  return maxIdx;
}
var arrayFunctions = [
  {
    name: "sumEvens",
    fn: sumEvens,
    parameterTypes: ["number[]"],
    description: "Sum all even numbers in an array",
    difficulty: "easy"
  },
  {
    name: "sumOdds",
    fn: sumOdds,
    parameterTypes: ["number[]"],
    description: "Sum all odd numbers in an array",
    difficulty: "easy"
  },
  {
    name: "product",
    fn: product,
    parameterTypes: ["number[]"],
    description: "Calculate the product of all elements",
    difficulty: "easy"
  },
  {
    name: "rotateArray",
    fn: rotateArray,
    parameterTypes: ["number[]", "number"],
    description: "Rotate array by k positions to the right",
    difficulty: "medium"
  },
  {
    name: "findMedian",
    fn: findMedian,
    parameterTypes: ["number[]"],
    description: "Find the median value of an array",
    difficulty: "medium"
  },
  {
    name: "findMode",
    fn: findMode,
    parameterTypes: ["number[]"],
    description: "Find the mode (most frequent element)",
    difficulty: "medium"
  },
  {
    name: "range",
    fn: range,
    parameterTypes: ["number[]"],
    description: "Calculate the range (max - min) of an array",
    difficulty: "easy"
  },
  {
    name: "countGreaterThan",
    fn: countGreaterThan,
    parameterTypes: ["number[]", "number"],
    description: "Count elements greater than a threshold",
    difficulty: "easy"
  },
  {
    name: "countLessThan",
    fn: countLessThan,
    parameterTypes: ["number[]", "number"],
    description: "Count elements less than a threshold",
    difficulty: "easy"
  },
  {
    name: "secondLargest",
    fn: secondLargest,
    parameterTypes: ["number[]"],
    description: "Find the second largest element",
    difficulty: "medium"
  },
  {
    name: "runningSum",
    fn: runningSum,
    parameterTypes: ["number[]"],
    description: "Calculate running sum array",
    difficulty: "easy"
  },
  {
    name: "elementAtWrapped",
    fn: elementAtWrapped,
    parameterTypes: ["number[]", "number"],
    description: "Get element at index with wrapping",
    difficulty: "easy"
  },
  {
    name: "dotProduct",
    fn: dotProduct,
    parameterTypes: ["number[]", "number[]"],
    description: "Calculate dot product of two arrays",
    difficulty: "medium"
  },
  {
    name: "maxIndex",
    fn: maxIndex,
    parameterTypes: ["number[]"],
    description: "Find index of maximum element",
    difficulty: "easy"
  }
];

// src/functions/composite.ts
function applyChainedOperations(initialValue, operations) {
  let result = initialValue;
  for (const op of operations) {
    switch (op.operation) {
      case "add":
        result += op.value ?? 0;
        break;
      case "subtract":
        result -= op.value ?? 0;
        break;
      case "multiply":
        result *= op.value ?? 1;
        break;
      case "divide":
        if (op.value === 0) throw new Error("Division by zero");
        result /= op.value ?? 1;
        break;
      case "modulo":
        if (op.value === 0) throw new Error("Modulo by zero");
        result %= op.value ?? 1;
        break;
      case "power":
        result = Math.pow(result, op.value ?? 1);
        break;
      case "floor":
        result = Math.floor(result);
        break;
      case "ceil":
        result = Math.ceil(result);
        break;
      case "abs":
        result = Math.abs(result);
        break;
      case "negate":
        result = -result;
        break;
      default:
        throw new Error(`Unknown operation: ${op.operation}`);
    }
  }
  return result;
}
function computeAndHash(a, b, c) {
  const step1 = a * b;
  const step2 = step1 + c;
  const step3 = step2 % 1e3;
  const step4 = step3 * (a % 10);
  return Math.abs(step4).toString(16).padStart(4, "0");
}
function evaluatePolynomial(a, b, c, x) {
  return a * x * x + b * x + c;
}
function weightedSum(values, weights) {
  if (values.length !== weights.length) {
    throw new Error("Values and weights must have same length");
  }
  let sum = 0;
  for (let i = 0; i < values.length; i++) {
    sum += values[i] * weights[i];
  }
  return sum;
}
function checksum(values) {
  let result = 0;
  for (let i = 0; i < values.length; i++) {
    result = (result << 5) - result + values[i] | 0;
  }
  return Math.abs(result);
}
function evaluateExpression(expr) {
  if (typeof expr === "number") {
    return expr;
  }
  if (!Array.isArray(expr) || expr.length !== 3) {
    throw new Error("Invalid expression format");
  }
  const [op, left, right] = expr;
  const leftVal = evaluateExpression(left);
  const rightVal = evaluateExpression(right);
  switch (op) {
    case "+":
      return leftVal + rightVal;
    case "-":
      return leftVal - rightVal;
    case "*":
      return leftVal * rightVal;
    case "/":
      if (rightVal === 0) throw new Error("Division by zero");
      return leftVal / rightVal;
    case "%":
      if (rightVal === 0) throw new Error("Modulo by zero");
      return leftVal % rightVal;
    case "^":
      return Math.pow(leftVal, rightVal);
    default:
      throw new Error(`Unknown operator: ${op}`);
  }
}
var compositeFunctions = [
  {
    name: "applyChainedOperations",
    fn: applyChainedOperations,
    parameterTypes: ["number", "ChainedOperation[]"],
    description: "Apply a chain of arithmetic operations to a value",
    difficulty: "medium"
  },
  {
    name: "computeAndHash",
    fn: computeAndHash,
    parameterTypes: ["number", "number", "number"],
    description: "Compute operations and return hex hash",
    difficulty: "hard"
  },
  {
    name: "evaluatePolynomial",
    fn: evaluatePolynomial,
    parameterTypes: ["number", "number", "number", "number"],
    description: "Evaluate polynomial a*x^2 + b*x + c",
    difficulty: "medium"
  },
  {
    name: "weightedSum",
    fn: weightedSum,
    parameterTypes: ["number[]", "number[]"],
    description: "Compute weighted sum of two arrays",
    difficulty: "medium"
  },
  {
    name: "checksum",
    fn: checksum,
    parameterTypes: ["number[]"],
    description: "Compute a simple checksum from values",
    difficulty: "medium"
  },
  {
    name: "evaluateExpression",
    fn: evaluateExpression,
    parameterTypes: ["expression"],
    description: "Evaluate a nested arithmetic expression",
    difficulty: "hard"
  }
];

// src/functions/index.ts
var allFunctions = [
  ...mathFunctions,
  ...stringFunctions,
  ...arrayFunctions,
  ...compositeFunctions
];
function getFunctionsByDifficulty(difficulty) {
  return allFunctions.filter((f) => f.difficulty === difficulty);
}
function getFunctionByName(name) {
  return allFunctions.find((f) => f.name === name);
}
function getRandomFunction(difficulty) {
  const pool = difficulty ? getFunctionsByDifficulty(difficulty) : allFunctions;
  if (pool.length === 0) {
    throw new Error(`No functions available for difficulty: ${difficulty}`);
  }
  const index = Math.floor(Math.random() * pool.length);
  return pool[index];
}
var functionCategories = {
  math: mathFunctions,
  string: stringFunctions,
  array: arrayFunctions,
  composite: compositeFunctions
};
function getFunctionsByCategory(category) {
  return functionCategories[category];
}

// src/core/generator.ts
var DEFAULT_CONFIG = {
  difficulty: "medium",
  challengeTypes: ["function_execution", "chained_operations", "encoded_instruction"],
  expirationMs: 3e4,
  // 30 seconds
  rateLimit: {
    maxAttempts: 10,
    windowMs: 6e4
  }
};
var ChallengeGenerator = class {
  config;
  constructor(config) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...config
    };
  }
  /**
   * Generate a new challenge
   */
  generate(overrides) {
    const type = overrides?.type ?? randomElement(this.config.challengeTypes);
    const difficulty = overrides?.difficulty ?? this.config.difficulty;
    const { payload, expectedAnswer } = this.generatePayload(type, difficulty);
    const id = generateId();
    const expiresAt = Date.now() + this.config.expirationMs;
    const signatureData = JSON.stringify({
      id,
      type,
      payload,
      expiresAt,
      expectedAnswer
    });
    const signature = signChallenge(signatureData, this.config.secret);
    const challenge = {
      id,
      type,
      difficulty,
      payload,
      expiresAt,
      signature
    };
    return { challenge, expectedAnswer };
  }
  /**
   * Generate payload for a specific challenge type
   */
  generatePayload(type, difficulty) {
    switch (type) {
      case "function_execution":
        return this.generateFunctionExecution(difficulty);
      case "chained_operations":
        return this.generateChainedOperations(difficulty);
      case "encoded_instruction":
        return this.generateEncodedInstruction(difficulty);
      case "pattern_extraction":
        return this.generatePatternExtraction(difficulty);
      case "code_transform":
        return this.generateCodeTransform(difficulty);
      default:
        throw new Error(`Unknown challenge type: ${type}`);
    }
  }
  /**
   * Generate a function execution challenge
   */
  generateFunctionExecution(difficulty) {
    const func = getRandomFunction(difficulty);
    const parameters = this.generateParameters(func.name, difficulty);
    const result = func.fn(...parameters);
    const responseEncoding = this.getResponseEncoding(difficulty);
    const expectedAnswer = encode(String(result), responseEncoding);
    const functionCode = this.getFunctionCodeString(func.name);
    const payload = {
      type: "function_execution",
      functionName: func.name,
      functionCode,
      parameters,
      responseEncoding
    };
    return { payload, expectedAnswer };
  }
  /**
   * Generate a chained operations challenge
   */
  generateChainedOperations(difficulty) {
    const operationCount = difficulty === "easy" ? 3 : difficulty === "medium" ? 5 : 7;
    const initialValue = randomInt(10, 100);
    const operations = [];
    let currentValue = initialValue;
    const availableOps = [
      "add",
      "subtract",
      "multiply",
      "modulo",
      "floor",
      "abs"
    ];
    if (difficulty === "hard") {
      availableOps.push("power", "ceil", "negate");
    }
    for (let i = 0; i < operationCount; i++) {
      const operation = randomElement(availableOps);
      let value;
      switch (operation) {
        case "add":
        case "subtract":
          value = randomInt(1, 50);
          break;
        case "multiply":
          value = randomInt(2, 10);
          break;
        case "divide":
          value = randomInt(2, 5);
          break;
        case "modulo":
          value = randomInt(10, 100);
          break;
        case "power":
          value = randomInt(1, 3);
          break;
        default:
          value = void 0;
      }
      operations.push({ operation, value });
      switch (operation) {
        case "add":
          currentValue += value;
          break;
        case "subtract":
          currentValue -= value;
          break;
        case "multiply":
          currentValue *= value;
          break;
        case "divide":
          currentValue /= value;
          break;
        case "modulo":
          currentValue %= value;
          break;
        case "power":
          currentValue = Math.pow(currentValue, value);
          break;
        case "floor":
          currentValue = Math.floor(currentValue);
          break;
        case "ceil":
          currentValue = Math.ceil(currentValue);
          break;
        case "abs":
          currentValue = Math.abs(currentValue);
          break;
        case "negate":
          currentValue = -currentValue;
          break;
      }
    }
    const responseEncoding = this.getResponseEncoding(difficulty);
    const expectedAnswer = encode(String(currentValue), responseEncoding);
    const payload = {
      type: "chained_operations",
      initialValue,
      operations,
      responseEncoding
    };
    return { payload, expectedAnswer };
  }
  /**
   * Generate an encoded instruction challenge
   */
  generateEncodedInstruction(difficulty) {
    const a = randomInt(10, 100);
    const b = randomInt(10, 100);
    const operations = ["+", "-", "*"];
    const op = randomElement(operations);
    let result;
    switch (op) {
      case "+":
        result = a + b;
        break;
      case "-":
        result = a - b;
        break;
      case "*":
        result = a * b;
        break;
      default:
        result = a + b;
    }
    const instruction = `Calculate: ${a} ${op} ${b}`;
    const instructionEncoding = this.getInstructionEncoding(difficulty);
    const responseEncoding = this.getResponseEncoding(difficulty);
    const encodedInstruction = encode(instruction, instructionEncoding);
    const expectedAnswer = encode(String(result), responseEncoding);
    const payload = {
      type: "encoded_instruction",
      instruction: encodedInstruction,
      instructionEncoding,
      responseEncoding
    };
    return { payload, expectedAnswer };
  }
  /**
   * Generate a pattern extraction challenge
   */
  generatePatternExtraction(difficulty) {
    const count = difficulty === "easy" ? 3 : difficulty === "medium" ? 5 : 7;
    const items = [];
    for (let i = 0; i < count; i++) {
      items.push({
        id: i + 1,
        value: randomInt(10, 100)
      });
    }
    const queries = [
      { query: "sum(items[*].value)", fn: (data) => data.reduce((s, i) => s + i.value, 0) },
      { query: "max(items[*].value)", fn: (data) => Math.max(...data.map((i) => i.value)) },
      { query: "min(items[*].value)", fn: (data) => Math.min(...data.map((i) => i.value)) },
      { query: "count(items)", fn: (data) => data.length }
    ];
    const selected = randomElement(queries);
    const result = selected.fn(items);
    const responseEncoding = this.getResponseEncoding(difficulty);
    const expectedAnswer = encode(String(result), responseEncoding);
    return {
      payload: {
        type: "pattern_extraction",
        data: { items },
        query: selected.query,
        responseEncoding
      },
      expectedAnswer
    };
  }
  /**
   * Generate a code transform challenge
   */
  generateCodeTransform(difficulty) {
    const a = randomInt(1, 20);
    const b = randomInt(1, 20);
    const code = `const x = ${a}; const y = ${b}; return x + y;`;
    const result = a + b;
    const responseEncoding = this.getResponseEncoding(difficulty);
    const expectedAnswer = encode(String(result), responseEncoding);
    return {
      payload: {
        type: "code_transform",
        code,
        transform: "execute",
        responseEncoding
      },
      expectedAnswer
    };
  }
  /**
   * Get response encoding based on difficulty
   */
  getResponseEncoding(difficulty) {
    switch (difficulty) {
      case "easy":
        return "plain";
      case "medium":
        return randomElement(["plain", "base64"]);
      case "hard":
        return randomElement(["base64", "hex"]);
    }
  }
  /**
   * Get instruction encoding based on difficulty
   */
  getInstructionEncoding(difficulty) {
    switch (difficulty) {
      case "easy":
        return "base64";
      case "medium":
        return randomElement(["base64", "rot13"]);
      case "hard":
        return randomElement(["hex", "rot13"]);
    }
  }
  /**
   * Generate parameters for a function
   */
  generateParameters(functionName, difficulty) {
    const range2 = difficulty === "easy" ? [1, 20] : difficulty === "medium" ? [10, 50] : [20, 100];
    switch (functionName) {
      case "fibonacci":
        return [randomInt(5, 15)];
      // Keep reasonable for performance
      case "isPrime":
        return [randomInt(range2[0], range2[1])];
      case "gcd":
      case "lcm":
        return [randomInt(range2[0], range2[1]), randomInt(range2[0], range2[1])];
      case "factorial":
        return [randomInt(3, 10)];
      // Keep reasonable
      case "modPow":
        return [randomInt(2, 10), randomInt(2, 8), randomInt(10, 50)];
      case "digitSum":
      case "digitCount":
      case "isPerfectSquare":
      case "triangular":
        return [randomInt(range2[0], range2[1])];
      case "sumOfPrimes":
        return [randomInt(3, 8)];
      // Keep reasonable
      // String functions
      case "reverseWords":
      case "reverseString":
      case "countVowels":
      case "countConsonants":
      case "removeVowels":
      case "alternatingCase":
      case "wordCount":
      case "longestWord":
      case "asciiSum":
        return [this.generateRandomWords(difficulty === "easy" ? 2 : difficulty === "medium" ? 4 : 6)];
      case "caesarCipher":
        return [this.generateRandomWords(3), randomInt(1, 25)];
      case "hammingDistance":
        const word = this.generateRandomWord(5);
        return [word, this.mutateWord(word, 2)];
      case "countSubstring":
        return ["hello world hello", "hello"];
      case "charAtWrapped":
        return ["alphabet", randomInt(0, 20)];
      // Array functions
      case "sumEvens":
      case "sumOdds":
      case "product":
      case "findMedian":
      case "findMode":
      case "range":
      case "secondLargest":
      case "runningSum":
      case "maxIndex":
        return [this.generateRandomArray(difficulty === "easy" ? 4 : difficulty === "medium" ? 6 : 8)];
      case "rotateArray":
        return [this.generateRandomArray(5), randomInt(1, 5)];
      case "countGreaterThan":
      case "countLessThan":
        return [this.generateRandomArray(6), randomInt(20, 50)];
      case "elementAtWrapped":
        return [this.generateRandomArray(5), randomInt(0, 10)];
      case "dotProduct": {
        const len = difficulty === "easy" ? 3 : difficulty === "medium" ? 4 : 5;
        return [this.generateRandomArray(len), this.generateRandomArray(len)];
      }
      // Composite functions
      case "evaluatePolynomial":
        return [randomInt(1, 5), randomInt(1, 10), randomInt(1, 10), randomInt(1, 5)];
      case "weightedSum": {
        const wlen = difficulty === "easy" ? 3 : 4;
        return [this.generateRandomArray(wlen), this.generateRandomArray(wlen)];
      }
      case "checksum":
        return [this.generateRandomArray(5)];
      case "computeAndHash":
        return [randomInt(10, 50), randomInt(10, 50), randomInt(10, 50)];
      default:
        return [randomInt(range2[0], range2[1])];
    }
  }
  /**
   * Generate random words joined by spaces
   */
  generateRandomWords(count) {
    const words = ["hello", "world", "test", "code", "data", "alpha", "beta", "gamma"];
    const selected = [];
    for (let i = 0; i < count; i++) {
      selected.push(randomElement(words));
    }
    return selected.join(" ");
  }
  /**
   * Generate a random word
   */
  generateRandomWord(length) {
    const chars = "abcdefghijklmnopqrstuvwxyz";
    let word = "";
    for (let i = 0; i < length; i++) {
      word += chars[randomInt(0, chars.length - 1)];
    }
    return word;
  }
  /**
   * Mutate a word by changing N characters
   */
  mutateWord(word, changes) {
    const chars = word.split("");
    const positions = /* @__PURE__ */ new Set();
    while (positions.size < Math.min(changes, word.length)) {
      positions.add(randomInt(0, word.length - 1));
    }
    for (const pos of positions) {
      let newChar;
      do {
        newChar = "abcdefghijklmnopqrstuvwxyz"[randomInt(0, 25)];
      } while (newChar === chars[pos]);
      chars[pos] = newChar;
    }
    return chars.join("");
  }
  /**
   * Generate a random array of numbers
   */
  generateRandomArray(length) {
    const arr = [];
    for (let i = 0; i < length; i++) {
      arr.push(randomInt(1, 50));
    }
    return arr;
  }
  /**
   * Get function code as string (for display)
   */
  getFunctionCodeString(functionName) {
    const codeMap = {
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
}`
    };
    return codeMap[functionName] || `function ${functionName}(...args) { /* implementation */ }`;
  }
};
function createGenerator(config) {
  return new ChallengeGenerator(config);
}

// src/utils/rate-limiter.ts
var RateLimiter = class {
  entries = /* @__PURE__ */ new Map();
  config;
  cleanupInterval = null;
  constructor(config) {
    this.config = {
      maxAttempts: config.maxAttempts,
      windowMs: config.windowMs
    };
    this.startCleanup();
  }
  /**
   * Check if a key is rate limited
   */
  isRateLimited(key) {
    const entry = this.entries.get(key);
    if (!entry) {
      return false;
    }
    if (Date.now() > entry.resetAt) {
      this.entries.delete(key);
      return false;
    }
    return entry.count >= this.config.maxAttempts;
  }
  /**
   * Record an attempt for a key
   */
  recordAttempt(key) {
    const now = Date.now();
    let entry = this.entries.get(key);
    if (!entry || now > entry.resetAt) {
      entry = {
        count: 0,
        resetAt: now + this.config.windowMs
      };
      this.entries.set(key, entry);
    }
    if (entry.count >= this.config.maxAttempts) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: entry.resetAt
      };
    }
    entry.count++;
    return {
      allowed: true,
      remaining: this.config.maxAttempts - entry.count,
      resetAt: entry.resetAt
    };
  }
  /**
   * Get remaining attempts for a key
   */
  getRemainingAttempts(key) {
    const entry = this.entries.get(key);
    if (!entry || Date.now() > entry.resetAt) {
      return this.config.maxAttempts;
    }
    return Math.max(0, this.config.maxAttempts - entry.count);
  }
  /**
   * Reset rate limit for a key
   */
  reset(key) {
    this.entries.delete(key);
  }
  /**
   * Clear all rate limit entries
   */
  clear() {
    this.entries.clear();
  }
  /**
   * Start periodic cleanup of expired entries
   */
  startCleanup() {
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 6e4);
    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref();
    }
  }
  /**
   * Stop the cleanup interval
   */
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.clear();
  }
  /**
   * Remove expired entries
   */
  cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.entries) {
      if (now > entry.resetAt) {
        this.entries.delete(key);
      }
    }
  }
  /**
   * Get current stats
   */
  getStats() {
    let totalAttempts = 0;
    for (const entry of this.entries.values()) {
      totalAttempts += entry.count;
    }
    return {
      activeKeys: this.entries.size,
      totalAttempts
    };
  }
};
function createRateLimiter(config) {
  return new RateLimiter({
    maxAttempts: config?.maxAttempts ?? 10,
    windowMs: config?.windowMs ?? 6e4
    // 1 minute default
  });
}

// src/core/verifier.ts
var ChallengeVerifier = class {
  config;
  rateLimiter;
  challengeStore = /* @__PURE__ */ new Map();
  cleanupInterval = null;
  constructor(config) {
    this.config = {
      difficulty: "medium",
      challengeTypes: ["function_execution", "chained_operations", "encoded_instruction"],
      expirationMs: 3e4,
      rateLimit: {
        maxAttempts: 10,
        windowMs: 6e4
      },
      ...config
    };
    this.rateLimiter = createRateLimiter(this.config.rateLimit);
    this.startCleanup();
  }
  /**
   * Store expected answer for a challenge
   */
  storeChallenge(challengeId, expectedAnswer, expiresAt) {
    this.challengeStore.set(challengeId, { expectedAnswer, expiresAt });
  }
  /**
   * Verify a challenge solution
   */
  verify(challenge, solution, clientIdentifier) {
    const clientKey = clientIdentifier || "anonymous";
    const rateLimitResult = this.rateLimiter.recordAttempt(clientKey);
    if (!rateLimitResult.allowed) {
      return {
        valid: false,
        error: `Rate limited. Try again in ${Math.ceil((rateLimitResult.resetAt - Date.now()) / 1e3)} seconds.`,
        errorCode: "RATE_LIMITED"
      };
    }
    if (challenge.id !== solution.challengeId) {
      return {
        valid: false,
        error: "Challenge ID mismatch",
        errorCode: "CHALLENGE_NOT_FOUND"
      };
    }
    if (Date.now() > challenge.expiresAt) {
      return {
        valid: false,
        error: "Challenge has expired",
        errorCode: "EXPIRED"
      };
    }
    const stored = this.challengeStore.get(challenge.id);
    if (!stored) {
      return {
        valid: false,
        error: "Challenge not found or already used",
        errorCode: "CHALLENGE_NOT_FOUND"
      };
    }
    if (Date.now() > stored.expiresAt) {
      this.challengeStore.delete(challenge.id);
      return {
        valid: false,
        error: "Challenge has expired",
        errorCode: "EXPIRED"
      };
    }
    const signatureData = JSON.stringify({
      id: challenge.id,
      type: challenge.type,
      payload: challenge.payload,
      expiresAt: challenge.expiresAt,
      expectedAnswer: stored.expectedAnswer
    });
    const expectedSignature = signChallenge(signatureData, this.config.secret);
    if (!safeCompare(challenge.signature, expectedSignature)) {
      return {
        valid: false,
        error: "Invalid challenge signature",
        errorCode: "INVALID_SIGNATURE"
      };
    }
    if (!safeCompare(solution.solution, stored.expectedAnswer)) {
      return {
        valid: false,
        error: "Incorrect solution",
        errorCode: "INVALID_SOLUTION"
      };
    }
    this.challengeStore.delete(challenge.id);
    this.rateLimiter.reset(clientKey);
    return { valid: true };
  }
  /**
   * Verify a solution using only the signature (stateless mode)
   * 
   * In stateless mode, the expected answer is encoded in the signature
   * This is less secure but allows for distributed deployments
   */
  verifyStateless(challenge, solution, clientIdentifier) {
    const clientKey = clientIdentifier || "anonymous";
    const rateLimitResult = this.rateLimiter.recordAttempt(clientKey);
    if (!rateLimitResult.allowed) {
      return {
        valid: false,
        error: `Rate limited. Try again in ${Math.ceil((rateLimitResult.resetAt - Date.now()) / 1e3)} seconds.`,
        errorCode: "RATE_LIMITED"
      };
    }
    if (challenge.id !== solution.challengeId) {
      return {
        valid: false,
        error: "Challenge ID mismatch",
        errorCode: "CHALLENGE_NOT_FOUND"
      };
    }
    if (Date.now() > challenge.expiresAt) {
      return {
        valid: false,
        error: "Challenge has expired",
        errorCode: "EXPIRED"
      };
    }
    const signatureData = JSON.stringify({
      id: challenge.id,
      type: challenge.type,
      payload: challenge.payload,
      expiresAt: challenge.expiresAt,
      expectedAnswer: solution.solution
    });
    const computedSignature = signChallenge(signatureData, this.config.secret);
    if (!safeCompare(challenge.signature, computedSignature)) {
      return {
        valid: false,
        error: "Incorrect solution",
        errorCode: "INVALID_SOLUTION"
      };
    }
    return { valid: true };
  }
  /**
   * Get rate limit status for a client
   */
  getRateLimitStatus(clientIdentifier) {
    return {
      remaining: this.rateLimiter.getRemainingAttempts(clientIdentifier),
      isLimited: this.rateLimiter.isRateLimited(clientIdentifier)
    };
  }
  /**
   * Start periodic cleanup of expired challenges
   */
  startCleanup() {
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 6e4);
    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref();
    }
  }
  /**
   * Clean up expired challenges
   */
  cleanup() {
    const now = Date.now();
    for (const [id, stored] of this.challengeStore) {
      if (now > stored.expiresAt) {
        this.challengeStore.delete(id);
      }
    }
  }
  /**
   * Destroy the verifier and clean up resources
   */
  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.rateLimiter.destroy();
    this.challengeStore.clear();
  }
  /**
   * Get stats for monitoring
   */
  getStats() {
    return {
      pendingChallenges: this.challengeStore.size,
      rateLimitStats: this.rateLimiter.getStats()
    };
  }
};
function createVerifier(config) {
  return new ChallengeVerifier(config);
}

// src/server/standalone.ts
var UnCaptcha = class {
  generator;
  verifier;
  config;
  constructor(config) {
    this.config = config;
    this.generator = new ChallengeGenerator(config);
    this.verifier = new ChallengeVerifier(config);
  }
  /**
   * Generate a new challenge
   */
  generate(options) {
    const result = this.generator.generate(options);
    this.verifier.storeChallenge(
      result.challenge.id,
      result.expectedAnswer,
      result.challenge.expiresAt
    );
    return result;
  }
  /**
   * Verify a challenge solution
   */
  verify(challenge, solution, clientIdentifier) {
    const challengeSolution = {
      challengeId: challenge.id,
      solution
    };
    return this.verifier.verify(challenge, challengeSolution, clientIdentifier);
  }
  /**
   * Verify a challenge solution in stateless mode
   * (no server-side storage required)
   */
  verifyStateless(challenge, solution, clientIdentifier) {
    const challengeSolution = {
      challengeId: challenge.id,
      solution
    };
    return this.verifier.verifyStateless(challenge, challengeSolution, clientIdentifier);
  }
  /**
   * Get rate limit status for a client
   */
  getRateLimitStatus(clientIdentifier) {
    return this.verifier.getRateLimitStatus(clientIdentifier);
  }
  /**
   * Get stats for monitoring
   */
  getStats() {
    return this.verifier.getStats();
  }
  /**
   * Get the current configuration
   */
  getConfig() {
    return { ...this.config };
  }
  /**
   * Destroy and clean up resources
   */
  destroy() {
    this.verifier.destroy();
  }
};
function createUnCaptcha(config) {
  return new UnCaptcha(config);
}

// src/server/middleware.ts
var DEFAULT_MIDDLEWARE_CONFIG = {
  challengeIdHeader: "x-uncaptcha-id",
  solutionHeader: "x-uncaptcha-solution",
  challengeEndpoint: "/_uncaptcha/challenge"
};
function createExpressMiddleware(config) {
  const fullConfig = { ...DEFAULT_MIDDLEWARE_CONFIG, ...config };
  const generator = new ChallengeGenerator(fullConfig);
  const verifier = new ChallengeVerifier(fullConfig);
  function getClientIdentifier(req) {
    const forwarded = req.headers["x-forwarded-for"];
    if (forwarded) {
      const ip = Array.isArray(forwarded) ? forwarded[0] : forwarded.split(",")[0];
      return ip.trim();
    }
    return req.ip || req.socket.remoteAddress || "unknown";
  }
  const challenge = (_req, res) => {
    try {
      const { challenge: challenge2, expectedAnswer } = generator.generate();
      verifier.storeChallenge(challenge2.id, expectedAnswer, challenge2.expiresAt);
      res.json({
        success: true,
        challenge: {
          id: challenge2.id,
          type: challenge2.type,
          difficulty: challenge2.difficulty,
          payload: challenge2.payload,
          expiresAt: challenge2.expiresAt,
          signature: challenge2.signature
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: "Failed to generate challenge"
      });
    }
  };
  const protect = (req, res, next) => {
    const clientIdentifier = getClientIdentifier(req);
    req.unCaptcha = {
      verified: false,
      clientIdentifier
    };
    const challengeId = req.headers[fullConfig.challengeIdHeader];
    const solution = req.headers[fullConfig.solutionHeader];
    if (!challengeId || !solution) {
      res.status(401).json({
        success: false,
        error: "Missing challenge credentials",
        challengeEndpoint: fullConfig.challengeEndpoint,
        headers: {
          challengeId: fullConfig.challengeIdHeader,
          solution: fullConfig.solutionHeader
        }
      });
      return;
    }
    let challengeData;
    if (req.body && req.body._unCaptchaChallenge) {
      challengeData = req.body._unCaptchaChallenge;
    } else {
      res.status(401).json({
        success: false,
        error: "Challenge data required. Include _unCaptchaChallenge in body or use stateless mode."
      });
      return;
    }
    const challengeSolution = {
      challengeId,
      solution
    };
    const result = verifier.verify(challengeData, challengeSolution, clientIdentifier);
    if (!result.valid) {
      const statusCode = result.errorCode === "RATE_LIMITED" ? 429 : 401;
      res.status(statusCode).json({
        success: false,
        error: result.error,
        errorCode: result.errorCode
      });
      return;
    }
    req.unCaptcha.verified = true;
    req.unCaptcha.challenge = challengeData;
    next();
  };
  return {
    protect,
    challenge,
    generator,
    verifier
  };
}
function createVerificationEndpoint(config) {
  const fullConfig = { ...DEFAULT_MIDDLEWARE_CONFIG, ...config };
  const verifier = new ChallengeVerifier(fullConfig);
  return (req, res) => {
    const clientIdentifier = req.ip || "unknown";
    const { challenge, solution } = req.body;
    if (!challenge || !solution) {
      res.status(400).json({
        success: false,
        error: "Missing challenge or solution in request body"
      });
      return;
    }
    const challengeSolution = {
      challengeId: challenge.id,
      solution
    };
    const result = verifier.verifyStateless(challenge, challengeSolution, clientIdentifier);
    res.json({
      success: result.valid,
      error: result.error,
      errorCode: result.errorCode
    });
  };
}

export { ChallengeGenerator, ChallengeVerifier, UnCaptcha, allFunctions, createExpressMiddleware, createGenerator, createUnCaptcha, createVerificationEndpoint, createVerifier, decode, decodeBase64, decodeChain, decodeHex, decodeRot13, encode, encodeBase64, encodeChain, encodeHex, encodeRot13, functionCategories, getFunctionByName, getFunctionsByCategory, getFunctionsByDifficulty, getRandomFunction };
//# sourceMappingURL=index.mjs.map
//# sourceMappingURL=index.mjs.map