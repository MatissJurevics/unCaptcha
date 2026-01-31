# Challenge Types

unCaptcha includes 5 types of computational challenges designed to be easy for AI agents but tedious for humans.

---

## 1. Function Execution

The agent receives a function definition and parameters, and must compute the result.

**Example challenge:**

```json
{
  "type": "function_execution",
  "functionName": "fibonacci",
  "functionCode": "function fibonacci(n) { if (n <= 1) return n; let a = 0, b = 1; for (let i = 2; i <= n; i++) { const temp = a + b; a = b; b = temp; } return b; }",
  "parameters": [12],
  "responseEncoding": "base64"
}
```

**Expected:** Execute `fibonacci(12)` → `144` → encode as base64 → `"MTQ0"`

**Why humans struggle:** Manually tracing through code is slow and error-prone.

---

## 2. Chained Operations

The agent must apply a sequence of arithmetic operations to an initial value.

**Example challenge:**

```json
{
  "type": "chained_operations",
  "initialValue": 42,
  "operations": [
    { "operation": "multiply", "value": 3 },
    { "operation": "add", "value": 17 },
    { "operation": "modulo", "value": 50 }
  ],
  "responseEncoding": "plain"
}
```

**Expected:** `42 × 3 = 126` → `126 + 17 = 143` → `143 % 50 = 43`

**Available operations:**
- `add`, `subtract`, `multiply`, `divide`, `modulo`, `power`
- `floor`, `ceil`, `abs`, `negate`

**Why humans struggle:** Multiple steps mean multiple chances for calculation errors.

---

## 3. Encoded Instructions

The agent receives an instruction encoded in base64, hex, or rot13, must decode it, and compute the answer.

**Example challenge:**

```json
{
  "type": "encoded_instruction",
  "instruction": "Q2FsY3VsYXRlOiA0NSArIDg3",
  "instructionEncoding": "base64",
  "responseEncoding": "hex"
}
```

**Expected:** 
1. Decode base64 → `"Calculate: 45 + 87"`
2. Compute → `132`
3. Encode as hex → `"313332"`

**Supported encodings:**
- `base64` - Standard base64
- `hex` - Hexadecimal
- `rot13` - Caesar cipher with shift 13
- `plain` - No encoding

**Why humans struggle:** Manual decoding is tedious and time-consuming.

---

## 4. Pattern Extraction

The agent receives structured data and must execute a query expression.

**Example challenge:**

```json
{
  "type": "pattern_extraction",
  "data": {
    "items": [
      { "id": 1, "value": 25 },
      { "id": 2, "value": 50 },
      { "id": 3, "value": 75 }
    ]
  },
  "query": "sum(items[*].value)",
  "responseEncoding": "plain"
}
```

**Expected:** Sum all values → `150`

**Supported queries:**
- `sum(path)` - Sum of values
- `max(path)` - Maximum value
- `min(path)` - Minimum value
- `count(path)` - Number of items
- `avg(path)` - Average value

**Path syntax:** `items[*].value` selects `value` from each item in `items` array.

**Why humans struggle:** Parsing nested data and computing aggregates manually is slow.

---

## 5. Code Transform

The agent receives code to execute and optionally transform the result.

**Example challenge:**

```json
{
  "type": "code_transform",
  "code": "const x = 15; const y = 27; return x * y;",
  "transform": "execute",
  "responseEncoding": "base64"
}
```

**Expected:** Execute code → `405` → encode as base64 → `"NDA1"`

**Transform options:**
- `execute` - Just execute and return result
- `execute_and_base64` - Execute and base64 encode
- `execute_and_hash` - Execute and return hash

**Why humans struggle:** Mental code execution is hard, especially with multiple steps.

---

## Difficulty Levels

Difficulty affects several factors:

| Factor | Easy | Medium | Hard |
|--------|------|--------|------|
| Operations | 3 | 5 | 7 |
| Number range | 1-20 | 10-50 | 20-100 |
| Response encoding | plain/base64 | base64/rot13 | hex/rot13 |
| Available operations | Basic | Standard | All including power, ceil, negate |

---

## Built-in Functions

The function execution challenge uses these 44 built-in functions:

### Math (11 functions)
`fibonacci`, `isPrime`, `gcd`, `lcm`, `factorial`, `modPow`, `digitSum`, `digitCount`, `isPerfectSquare`, `triangular`, `sumOfPrimes`

### String (13 functions)
`reverseWords`, `reverseString`, `countVowels`, `countConsonants`, `caesarCipher`, `hammingDistance`, `countSubstring`, `charAtWrapped`, `asciiSum`, `removeVowels`, `alternatingCase`, `wordCount`, `longestWord`

### Array (14 functions)
`sumEvens`, `sumOdds`, `product`, `rotateArray`, `findMedian`, `findMode`, `range`, `countGreaterThan`, `countLessThan`, `secondLargest`, `runningSum`, `elementAtWrapped`, `dotProduct`, `maxIndex`

### Composite (6 functions)
`applyChainedOperations`, `computeAndHash`, `evaluatePolynomial`, `weightedSum`, `checksum`, `evaluateExpression`
