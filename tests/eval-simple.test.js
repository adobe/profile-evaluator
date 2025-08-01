const TestUtils = require('./testUtils');

describe('CLI Integration: --eval Option (Simple)', () => {
  const TEST_DATA_FILE = 'testfiles/camera_indicators.json';

  // Helper function to extract JSON result from CLI output
  function extractJsonResult(cliOutput) {
    const lines = cliOutput.split('\n');

    // Find the start of JSON output
    let jsonStartIndex = -1;
    for (let i = 0; i < lines.length; i++) {
      const trimmed = lines[i].trim();
      if (trimmed.startsWith('{') || trimmed.startsWith('[') || trimmed.startsWith('"') ||
        trimmed === 'true' || trimmed === 'false' || trimmed === 'null' ||
        /^-?\d+(\.\d+)?$/.test(trimmed)) {
        jsonStartIndex = i;
        break;
      }
    }

    if (jsonStartIndex === -1) {
      throw new Error('No JSON output found in CLI response');
    }

    // For simple values (single line), parse that line
    const firstJsonLine = lines[jsonStartIndex].trim();
    if (!firstJsonLine.startsWith('{') && !firstJsonLine.startsWith('[')) {
      return JSON.parse(firstJsonLine);
    }

    // For objects/arrays, use a simpler approach
    let jsonText = '';
    let braceCount = 0;
    let bracketCount = 0;
    let inJson = false;

    for (let i = jsonStartIndex; i < lines.length; i++) {
      const line = lines[i];
      jsonText += (i > jsonStartIndex ? '\n' : '') + line;

      // Simple counting without string handling complexity
      for (const char of line) {
        if (char === '{') {
          braceCount++;
          inJson = true;
        } else if (char === '}') {
          braceCount--;
        } else if (char === '[') {
          bracketCount++;
          inJson = true;
        } else if (char === ']') {
          bracketCount--;
        }
      }

      // Stop when we've closed all braces and brackets
      if (inJson && braceCount === 0 && bracketCount === 0) {
        break;
      }
    }

    return JSON.parse(jsonText);
  }

  // Test 1: Basic property access
  test('should extract a simple property', () => {
    const result = TestUtils.runCLIEval([TEST_DATA_FILE, '--eval', 'declaration']);
    expect(result.exitCode).toBe(0);
    const output = extractJsonResult(result.stdout);
    expect(output).toHaveProperty(['claim.v2']);
    expect(output).toHaveProperty('assertions');
  });

  // Test 2: Nested property access
  test('should extract nested properties', () => {
    const result = TestUtils.runCLIEval([TEST_DATA_FILE, '--eval', "declaration.'claim.v2'.alg"]);
    expect(result.exitCode).toBe(0);
    const output = extractJsonResult(result.stdout);
    expect(output).toBe('sha256');
  });

  // Test 3: Array access
  test('should access array elements', () => {
    const result = TestUtils.runCLIEval([TEST_DATA_FILE, '--eval', "'@context'[0]"]);
    expect(result.exitCode).toBe(0);
    const output = extractJsonResult(result.stdout);
    expect(output).toBe('https://jpeg.org/jpegtrust/');
  });

  // Test 4: String functions
  test('should use string functions', () => {
    const result = TestUtils.runCLIEval([TEST_DATA_FILE, '--eval', "upper(declaration.'claim.v2'.alg)"]);
    expect(result.exitCode).toBe(0);
    const output = extractJsonResult(result.stdout);
    expect(output).toBe('SHA256');
  });

  // Test 5: Mathematical operations
  test('should perform math operations', () => {
    const result = TestUtils.runCLIEval([TEST_DATA_FILE, '--eval', "length('@context') + 5"]);
    expect(result.exitCode).toBe(0);
    const output = extractJsonResult(result.stdout);
    expect(output).toBe(6);
  });
});
