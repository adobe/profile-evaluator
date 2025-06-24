const TestUtils = require('./testUtils');

describe('CLI Integration: Camera Indicators', () => {
    it('runs the CLI and produces valid JSON output', () => {
        const data = TestUtils.runJSONTest('camera');
        // Additional camera-specific assertions can be added here if needed
    });

    it('runs the CLI with --yaml and produces valid YAML output', () => {
        const yamlData = TestUtils.runYAMLTest('camera');
        // Additional camera-specific assertions can be added here if needed
    });
});
