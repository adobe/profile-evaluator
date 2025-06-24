const TestUtils = require('./testUtils');

describe('CLI Integration: GenAI Indicators', () => {
    it('runs the CLI and produces valid JSON output', () => {
        const data = TestUtils.runJSONTest('genai');
        // Additional genai-specific assertions can be added here if needed
    });

    it('runs the CLI with --yaml and produces valid YAML output', () => {
        const yamlData = TestUtils.runYAMLTest('genai');
        // Additional genai-specific assertions can be added here if needed
    });
});
