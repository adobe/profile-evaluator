const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const yaml = require('yaml');

/**
 * Test utilities for CLI integration tests
 */
class TestUtils {
  /**
   * Clean up output files before running tests
   * @param {string[]} filePaths - Array of file paths to remove
   */
  static cleanupFiles(filePaths) {
    filePaths.forEach(filePath => {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });
  }

  /**
   * Run the CLI with given parameters
   * @param {string} profilePath - Path to the profile file
   * @param {string} outputDir - Output directory
   * @param {string} indicatorsPath - Path to the indicators file
   * @param {boolean} isYaml - Whether to use --yaml flag
   */
  static runCLI(profilePath, outputDir, indicatorsPath, isYaml = false) {
    const yamlFlag = isYaml ? '--yaml' : '';
    const command = `node src/index.js -p "${profilePath}" -o "${outputDir}" ${yamlFlag} "${indicatorsPath}"`.trim();
    execSync(command, { stdio: 'inherit' });
  }

  /**
   * Validate that a file exists
   * @param {string} filePath - Path to the file
   */
  static validateFileExists(filePath) {
    expect(fs.existsSync(filePath)).toBe(true);
  }

  static validateData(data) {
    expect(typeof data).toBe('object');
    expect(data).not.toBeNull();

    // Check basic structure
    expect(Object.keys(data).length).toBeGreaterThan(0);
    expect(data).toHaveProperty('profile_metadata');
    expect(data.profile_metadata).toHaveProperty('name');
    expect(data).toHaveProperty('sections');

    // Validate sections structure (array of arrays)
    expect(Array.isArray(data.sections)).toBe(true);
    data.sections.forEach((sectionGroup, groupIndex) => {
      expect(Array.isArray(sectionGroup)).toBe(true);
      sectionGroup.forEach((section, sectionIndex) => {
        expect(typeof section).toBe('object');
        expect(section).not.toBeNull();
        expect(section).toHaveProperty('id');
        expect(section).toHaveProperty('report_text');
        expect(typeof section.id).toBe('string');
        expect(typeof section.report_text).toBe('string');

        // Check that section has either 'value' or 'title' property
        // expect(section.hasOwnProperty('value') || section.hasOwnProperty('title')).toBe(true);
      });
    });
  }

  /**
   * Validate JSON output structure
   * @param {string} filePath - Path to the JSON file
   * @returns {Object} Parsed JSON data
   */
  static validateJSONOutput(filePath) {
    this.validateFileExists(filePath);

    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    this.validateData(data);

    return data;
  }

  /**
   * Validate YAML output structure
   * @param {string} filePath - Path to the YAML file
   * @returns {Object} Parsed YAML data
   */
  static validateYAMLOutput(filePath) {
    this.validateFileExists(filePath);

    const yamlData = yaml.parse(fs.readFileSync(filePath, 'utf-8'));
    this.validateData(yamlData);

    return yamlData;
  }

  /**
   * Get test file paths for a given test name
   * @param {string} testName - Name of the test (e.g., 'camera', 'genai', 'no_manifests')
   * @returns {Object} Object containing all relevant file paths
   */
  static getTestPaths(testName) {
    const baseDir = path.resolve(__dirname);
    return {
      profilePath: path.resolve(baseDir, `../testfiles/${testName}_profile.yml`),
      indicatorsPath: path.resolve(baseDir, `../testfiles/${testName}_indicators.json`),
      outputDir: path.resolve(baseDir, '../output'),
      jsonOutput: path.join(path.resolve(baseDir, '../output'), `${testName}_indicators_report.json`),
      yamlOutput: path.join(path.resolve(baseDir, '../output'), `${testName}_indicators_report.yml`)
    };
  }

  /**
   * Run a complete JSON test suite for a given test name
   * @param {string} testName - Name of the test
   */
  static runJSONTest(testName) {
    const paths = this.getTestPaths(testName);

    // Clean up before test
    this.cleanupFiles([paths.jsonOutput]);

    // Run CLI
    this.runCLI(paths.profilePath, paths.outputDir, paths.indicatorsPath, false);

    // Validate output
    return this.validateJSONOutput(paths.jsonOutput);
  }

  /**
   * Run a complete YAML test suite for a given test name
   * @param {string} testName - Name of the test
   */
  static runYAMLTest(testName) {
    const paths = this.getTestPaths(testName);

    // Clean up before test
    this.cleanupFiles([paths.yamlOutput]);

    // Run CLI
    this.runCLI(paths.profilePath, paths.outputDir, paths.indicatorsPath, true);

    // Validate output
    return this.validateYAMLOutput(paths.yamlOutput);
  }
}

module.exports = TestUtils;
