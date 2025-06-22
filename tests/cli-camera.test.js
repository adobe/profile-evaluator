const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

describe('CLI Integration: Camera Indicators', () => {
  const profilePath = path.resolve(__dirname, '../testfiles/camera_profile.yml');
  const indicatorsPath = path.resolve(__dirname, '../testfiles/camera_indicators.json');
  const outputDir = path.resolve(__dirname, '../output');
  const expectedOutput = path.join(outputDir, 'camera_indicators_report.json');

  beforeAll(() => {
    // Remove output file if it exists
    if (fs.existsSync(expectedOutput)) {
      fs.unlinkSync(expectedOutput);
    }
  });

  it('runs the CLI and produces valid JSON output', () => {
    // Run the CLI
    execSync(`node src/index.js -p "${profilePath}" -o "${outputDir}" "${indicatorsPath}"`, { stdio: 'inherit' });
    // Check output file exists
    expect(fs.existsSync(expectedOutput)).toBe(true);
    // Validate JSON
    const data = JSON.parse(fs.readFileSync(expectedOutput, 'utf-8'));
    expect(typeof data).toBe('object');
    expect(data).not.toBeNull();

    // Optionally, check for some expected keys
    expect(Object.keys(data).length).toBeGreaterThan(0);
	expect(data).toHaveProperty('metadata');
	expect(data.metadata).toHaveProperty('name');
	expect(data).toHaveProperty('sections');
  });
});
