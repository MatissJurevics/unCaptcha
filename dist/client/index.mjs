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

// src/client/executor.ts
function executeFunction(code, params) {
  try {
    const wrapper = new Function(`
      ${code}
      return ${extractFunctionName(code)};
    `);
    const fn = wrapper();
    return fn(...params);
  } catch (error) {
    throw new Error(`Failed to execute function: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}
function extractFunctionName(code) {
  const match = code.match(/function\s+(\w+)/);
  if (match) {
    return match[1];
  }
  throw new Error("Could not extract function name from code");
}
function executeChainedOperations(initialValue, operations) {
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
function executeEncodedInstruction(encodedInstruction, encoding) {
  const instruction = decode(encodedInstruction, encoding);
  const match = instruction.match(/Calculate:\s*(\d+)\s*([+\-*\/])\s*(\d+)/);
  if (!match) {
    throw new Error(`Could not parse instruction: ${instruction}`);
  }
  const a = parseInt(match[1], 10);
  const op = match[2];
  const b = parseInt(match[3], 10);
  switch (op) {
    case "+":
      return a + b;
    case "-":
      return a - b;
    case "*":
      return a * b;
    case "/":
      return a / b;
    default:
      throw new Error(`Unknown operator: ${op}`);
  }
}
function executePatternExtraction(data, query) {
  const funcMatch = query.match(/^(\w+)\(([^)]+)\)$/);
  if (!funcMatch) {
    throw new Error(`Invalid query format: ${query}`);
  }
  const [, func, path] = funcMatch;
  const values = extractPathValues(data, path);
  switch (func.toLowerCase()) {
    case "sum":
      return values.reduce((a, b) => a + b, 0);
    case "max":
      return Math.max(...values);
    case "min":
      return Math.min(...values);
    case "count":
      return values.length;
    case "avg":
      const nums = values;
      return nums.reduce((a, b) => a + b, 0) / nums.length;
    default:
      throw new Error(`Unknown function: ${func}`);
  }
}
function extractPathValues(data, path) {
  const wildcardMatch = path.match(/^(\w+)\[\*\]\.(\w+)$/);
  if (wildcardMatch) {
    const [, arrayName, propName] = wildcardMatch;
    const arr = data[arrayName];
    if (!Array.isArray(arr)) {
      throw new Error(`Expected array at ${arrayName}`);
    }
    return arr.map((item) => item[propName]);
  }
  if (path in data) {
    const value = data[path];
    return Array.isArray(value) ? value : [value];
  }
  throw new Error(`Invalid path: ${path}`);
}
function executeCodeTransform(code, transform) {
  const fn = new Function(code);
  const result = fn();
  switch (transform) {
    case "execute":
      return result;
    case "execute_and_base64":
      return Buffer.from(String(result)).toString("base64");
    case "execute_and_hash":
      const str = String(result);
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash = hash & hash;
      }
      return Math.abs(hash).toString(16);
    default:
      throw new Error(`Unknown transform: ${transform}`);
  }
}
function executePayload(payload) {
  switch (payload.type) {
    case "function_execution": {
      const p = payload;
      return executeFunction(p.functionCode, p.parameters);
    }
    case "chained_operations": {
      const p = payload;
      return executeChainedOperations(p.initialValue, p.operations);
    }
    case "encoded_instruction": {
      const p = payload;
      return executeEncodedInstruction(p.instruction, p.instructionEncoding);
    }
    case "pattern_extraction": {
      const p = payload;
      return executePatternExtraction(p.data, p.query);
    }
    case "code_transform": {
      const p = payload;
      return executeCodeTransform(p.code, p.transform);
    }
    default:
      throw new Error(`Unknown challenge type: ${payload.type}`);
  }
}

// src/client/solver.ts
var UnCaptchaSolver = class {
  options;
  constructor(options) {
    this.options = {
      timeout: options?.timeout ?? 1e4,
      debug: options?.debug ?? false
    };
  }
  /**
   * Solve a challenge
   */
  solve(challenge) {
    const startTime = Date.now();
    try {
      if (Date.now() > challenge.expiresAt) {
        return {
          solution: "",
          solveDuration: Date.now() - startTime,
          success: false,
          error: "Challenge has expired"
        };
      }
      if (this.options.debug) {
        console.log(`[UnCaptcha] Solving ${challenge.type} challenge...`);
      }
      const rawResult = executePayload(challenge.payload);
      const responseEncoding = challenge.payload.responseEncoding || "plain";
      const solution = encode(String(rawResult), responseEncoding);
      const duration = Date.now() - startTime;
      if (this.options.debug) {
        console.log(`[UnCaptcha] Solved in ${duration}ms`);
      }
      return {
        solution,
        solveDuration: duration,
        success: true
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      if (this.options.debug) {
        console.error(`[UnCaptcha] Failed to solve: ${errorMessage}`);
      }
      return {
        solution: "",
        solveDuration: duration,
        success: false,
        error: errorMessage
      };
    }
  }
  /**
   * Solve a challenge and return formatted headers for HTTP request
   */
  solveForRequest(challenge) {
    const result = this.solve(challenge);
    if (!result.success) {
      return {
        headers: {},
        body: { _unCaptchaChallenge: challenge },
        success: false,
        error: result.error
      };
    }
    return {
      headers: {
        "x-uncaptcha-id": challenge.id,
        "x-uncaptcha-solution": result.solution
      },
      body: {
        _unCaptchaChallenge: challenge
      },
      success: true
    };
  }
  /**
   * Fetch a challenge from a server and solve it
   */
  async fetchAndSolve(challengeUrl, fetchOptions) {
    try {
      const response = await fetch(challengeUrl, {
        method: "GET",
        ...fetchOptions
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch challenge: ${response.statusText}`);
      }
      const data = await response.json();
      if (!data.success || !data.challenge) {
        throw new Error(data.error || "Invalid challenge response");
      }
      const challenge = data.challenge;
      const result = this.solve(challenge);
      return {
        challenge,
        solution: result.solution,
        success: result.success,
        error: result.error
      };
    } catch (error) {
      return {
        challenge: null,
        solution: "",
        success: false,
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
  }
  /**
   * Complete a protected request including challenge solving
   */
  async completeProtectedRequest(challengeUrl, protectedUrl, requestOptions) {
    const { challenge, solution, success, error } = await this.fetchAndSolve(challengeUrl);
    if (!success) {
      throw new Error(`Failed to solve challenge: ${error}`);
    }
    const headers = new Headers(requestOptions?.headers);
    headers.set("x-uncaptcha-id", challenge.id);
    headers.set("x-uncaptcha-solution", solution);
    headers.set("Content-Type", "application/json");
    const body = requestOptions?.body ? { ...JSON.parse(requestOptions.body), _unCaptchaChallenge: challenge } : { _unCaptchaChallenge: challenge };
    return fetch(protectedUrl, {
      ...requestOptions,
      headers,
      body: JSON.stringify(body)
    });
  }
};
function createSolver(options) {
  return new UnCaptchaSolver(options);
}

export { UnCaptchaSolver, createSolver, executeChainedOperations, executeCodeTransform, executeEncodedInstruction, executeFunction, executePatternExtraction, executePayload };
//# sourceMappingURL=index.mjs.map
//# sourceMappingURL=index.mjs.map