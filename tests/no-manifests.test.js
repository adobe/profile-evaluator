const TestUtils = require('./testUtils');

describe('CLI Integration: No Manifests Indicators', () => {
    it('runs the CLI and produces valid JSON output', () => {
        const data = TestUtils.runJSONTest('no_manifests');
        // Additional no-manifests-specific assertions can be added here if needed
    });

    it('runs the CLI with --yaml and produces valid YAML output', () => {
        const yamlData = TestUtils.runYAMLTest('no_manifests');
        // Additional no-manifests-specific assertions can be added here if needed
    });
});
