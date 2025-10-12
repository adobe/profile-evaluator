/*
Copyright 2025 Adobe. All rights reserved.
This file is licensed to you under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License. You may obtain a copy
of the License at http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under
the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
OF ANY KIND, either express or implied. See the License for the specific language
governing permissions and limitations under the License.
*/

const TestUtils = require('./testUtils');

describe('CLI Integration: No Manifests Indicators', () => {
  /**
   * Validate no-manifests-specific checks
   * @param {Object} data - The parsed JSON/YAML data
   */
  function validateNoManifestsSpecificChecks(data) {
    // Test that there's only one section containing all checks
    expect(data.statements).toHaveLength(1);
    const section1 = data.statements[0];

    // Test manifest presence check
    const manifestsCheck = section1.find(item => item.id === 'manifests');
    expect(manifestsCheck).toBeDefined();
    expect(manifestsCheck.value).toBe(false);
    expect(manifestsCheck.report_text).toContain('No Trust Manifests found');

    // Test overall profile compliance (should be false since no manifests)
    const complianceCheck = section1.find(item => item.id === 'jpt:profile_compliance');
    expect(complianceCheck).toBeDefined();
    expect(complianceCheck.value).toBe(false);
    expect(complianceCheck.report_text).toContain('not compliant with this profile');

    // Test general info section header
    const generalInfoCheck = section1.find(item => item.id === 'generalInfo');
    expect(generalInfoCheck).toBeDefined();
    expect(generalInfoCheck.title).toBe('General Information');
    expect(generalInfoCheck.report_text).toContain('general stuff');
  }

  it('runs the CLI and produces valid JSON output', () => {
    const data = TestUtils.runJSONTest('no_manifests');

    // Run no-manifests-specific validation checks
    TestUtils.validateSpecificChecks(data, validateNoManifestsSpecificChecks);
  });

  it('runs the CLI with --yaml and produces valid YAML output', () => {
    const yamlData = TestUtils.runYAMLTest('no_manifests');

    // Run no-manifests-specific validation checks
    TestUtils.validateSpecificChecks(yamlData, validateNoManifestsSpecificChecks);
  });
});
