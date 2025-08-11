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

describe('CLI Integration: Blocks Indicators', () => {
  /**
   * Validate blocks-specific checks based on the blocks indicators report
   * @param {Object} data - The parsed JSON/YAML data
   */
  function validateBlocksSpecificChecks(data) {
    // Validate that there is only one section group in statements
    expect(data.statements.length).toBe(1);

    const sectionGroup = data.statements[0];
    expect(sectionGroup.length).toBe(4);

    // Find and validate the first non-scalers section (object test)
    const objectSection = TestUtils.findSectionById(data, 'non-scalers');
    expect(objectSection).toBeDefined();
    expect(objectSection.report_text).toBe('Object - {"alg":"sha256","hash":"na6lb3F/uIdiAhZtZp4Oa2aNCj1UvcHVxx/p5ISE2AA="}');

    // Find and validate the missing helper section
    const missingHelperSection = TestUtils.findSectionById(data, 'missing helper');
    expect(missingHelperSection).toBeDefined();
    expect(missingHelperSection.report_text).toBe("Foo - '🔴 Missing: foo()'");

    // Find and validate the conditional expression section
    const conditionalSection = TestUtils.findSectionById(data, 'test_conditional_expression');
    expect(conditionalSection).toBeDefined();
    expect(conditionalSection.report_text).toBe('Status -  Match');

    // Validate profile metadata
    expect(data.profile_metadata).toBeDefined();
    expect(data.profile_metadata.name).toBe('Testing Profile');
    expect(data.profile_metadata.issuer).toBe('JPEG Trust Committee');
    expect(data.profile_metadata.version).toBe('2.0.0');

    // Validate additional test data sections
    expect(data.test_map).toBeDefined();
    expect(data.test_map.alg).toBe('sha256');
    expect(data.test_map.noTemplate).toBe(true);

    expect(data.test_array).toBeDefined();
    expect(Array.isArray(data.test_array)).toBe(true);
    expect(data.test_array).toContain('sha256');
    expect(data.test_array).toContain(123456);

    expect(data.test_scaler).toBe(4);

    expect(data.test_array_return).toBeDefined();
    expect(Array.isArray(data.test_array_return)).toBe(true);
    expect(data.test_array_return[0]).toHaveProperty('length', 7520);
    expect(data.test_array_return[0]).toHaveProperty('start', 2);

    expect(data.test_map_return).toBeDefined();
    expect(data.test_map_return['c2pa.hash.data']).toBe('assertion.hashedURI.match');
    expect(data.test_map_return['c2pa.actions.v2']).toBe('assertion.hashedURI.match');
  }

  it('runs the CLI and produces valid JSON output', () => {
    const data = TestUtils.runJSONTest('blocks');

    // Run blocks-specific validation checks
    TestUtils.validateSpecificChecks(data, validateBlocksSpecificChecks);
  });

  it('runs the CLI with --yaml and produces valid YAML output', () => {
    const yamlData = TestUtils.runYAMLTest('blocks');

    // Run blocks-specific validation checks
    TestUtils.validateSpecificChecks(yamlData, validateBlocksSpecificChecks);
  });
});
