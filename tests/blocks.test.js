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
    // Validate that there are now two section groups in statements
    expect(data.statements.length).toBe(2);

    const firstSectionGroup = data.statements[0];
    expect(firstSectionGroup.length).toBe(4);

    const secondSectionGroup = data.statements[1];
    expect(secondSectionGroup.length).toBe(2);

    // Find and validate the first non-scalers section (object test)
    const objectSection = TestUtils.findSectionById(data, 'non-scalers');
    expect(objectSection).toBeDefined();
    expect(objectSection.report_text).toBe('Object - {"alg":"sha256","hash":"na6lb3F/uIdiAhZtZp4Oa2aNCj1UvcHVxx/p5ISE2AA="}');

    // Find and validate the missing helper section
    const missingHelperSection = TestUtils.findSectionById(data, 'missing helper');
    expect(missingHelperSection).toBeDefined();
    expect(missingHelperSection.report_text).toBe("Foo - '🔴 Missing: foo()'");

    // Find and validate the test_expression section (note: has value instead of report_text)
    const testExpressionSection = TestUtils.findSectionById(data, 'test_expression');
    expect(testExpressionSection).toBeDefined();
    expect(testExpressionSection.value).toBe(25);

    // Find and validate the conditional expression section
    const conditionalSection = TestUtils.findSectionById(data, 'test_conditional_expression');
    expect(conditionalSection).toBeDefined();
    expect(conditionalSection.report_text).toBe('Status -  Match');

    // Find and validate the reputation section
    const reputationSection = TestUtils.findSectionById(data, 'reputation');
    expect(reputationSection).toBeDefined();
    expect(reputationSection.report_text).toBe('Reputation - good');

    // Validate profile metadata
    expect(data.profile_metadata).toBeDefined();
    expect(data.profile_metadata.name).toBe('Testing Profile');
    expect(data.profile_metadata.issuer).toBe('JPEG Trust Committee');
    expect(data.profile_metadata.version).toBe('2.0.0');

    // Validate original test data blocks
    expect(data.test_map).toBeDefined();
    expect(data.test_map.alg).toBe('sha256');
    expect(data.test_map.hash).toBe('na6lb3F/uIdiAhZtZp4Oa2aNCj1UvcHVxx/p5ISE2AA=');
    expect(data.test_map.noTemplate).toBe(true);

    expect(data.test_array).toBeDefined();
    expect(Array.isArray(data.test_array)).toBe(true);
    expect(data.test_array).toContain('sha256');
    expect(data.test_array).toContain('na6lb3F/uIdiAhZtZp4Oa2aNCj1UvcHVxx/p5ISE2AA=');
    expect(data.test_array).toContain(123456);

    expect(data.test_scaler).toBe(4);

    expect(data.test_array_return).toBeDefined();
    expect(Array.isArray(data.test_array_return)).toBe(true);
    expect(data.test_array_return[0]).toHaveProperty('length', 7520);
    expect(data.test_array_return[0]).toHaveProperty('start', 2);

    expect(data.test_map_return).toBeDefined();
    expect(data.test_map_return['c2pa.hash.data']).toBe('assertion.hashedURI.match');
    expect(data.test_map_return['c2pa.actions.v2']).toBe('assertion.hashedURI.match');

    // Validate new blocks that have been added

    // Test expression block (computed value)
    expect(data.test_expression).toBe(25);

    // Asset info block
    expect(data.asset_info).toBeDefined();
    expect(data.asset_info.alg).toBe('sha256');
    expect(data.asset_info.hash).toBe('na6lb3F/uIdiAhZtZp4Oa2aNCj1UvcHVxx/p5ISE2AA=');
    expect(data.asset_info.myNumber).toBe(100);

    // Asset info 2 block (references other blocks)
    expect(data.asset_info_2).toBeDefined();
    expect(data.asset_info_2.alg).toBe('sha256');
    expect(data.asset_info_2.hash).toBe('na6lb3F/uIdiAhZtZp4Oa2aNCj1UvcHVxx/p5ISE2AA=');
    expect(data.asset_info_2.myNumber).toBe(100);

    // MyExample block (references profile metadata)
    expect(data.myExample).toBeDefined();
    expect(data.myExample.description).toBe('This is a test example');
    expect(data.myExample.myDate).toBe('2025-06-17T22:44:49.717Z');
    expect(data.myExample.myNumber).toBe(25);
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

  // Additional specific tests for new blocks

  it('validates test_expression block returns computed value', () => {
    const data = TestUtils.runJSONTest('blocks');

    // test_expression should be computed from profile.test_expression (5*5 = 25)
    expect(data.test_expression).toBe(25);
  });

  it('validates asset_info block structure and values', () => {
    const data = TestUtils.runJSONTest('blocks');

    // asset_info block should contain algorithm, hash, and a custom number
    expect(data.asset_info).toBeDefined();
    expect(typeof data.asset_info).toBe('object');
    expect(data.asset_info.alg).toBe('sha256');
    expect(data.asset_info.hash).toBe('na6lb3F/uIdiAhZtZp4Oa2aNCj1UvcHVxx/p5ISE2AA=');
    expect(data.asset_info.myNumber).toBe(100);
  });

  it('validates asset_info_2 block references other blocks correctly', () => {
    const data = TestUtils.runJSONTest('blocks');

    // asset_info_2 should reference values from asset_info block
    expect(data.asset_info_2).toBeDefined();
    expect(typeof data.asset_info_2).toBe('object');
    expect(data.asset_info_2.alg).toBe(data.asset_info.alg);
    expect(data.asset_info_2.hash).toBe(data.asset_info.hash);
    expect(data.asset_info_2.myNumber).toBe(data.asset_info.myNumber);
  });

  it('validates myExample block uses profile metadata correctly', () => {
    const data = TestUtils.runJSONTest('blocks');

    // myExample should include templated values from profile metadata
    expect(data.myExample).toBeDefined();
    expect(typeof data.myExample).toBe('object');
    expect(data.myExample.description).toBe('This is a test example');
    expect(data.myExample.myDate).toBe(data.profile_metadata.date);
    expect(data.myExample.myNumber).toBe(25); // Computed from 5*5 expression
  });

  it('validates reputation statement is processed correctly', () => {
    const data = TestUtils.runJSONTest('blocks');

    // Find the reputation section in statements
    const reputationSection = TestUtils.findSectionById(data, 'reputation');
    expect(reputationSection).toBeDefined();
    expect(reputationSection.report_text).toBe('Reputation - good');
  });

  it('validates all blocks are present in output', () => {
    const data = TestUtils.runJSONTest('blocks');

    // Verify all expected blocks are present
    const expectedBlocks = [
      'test_map',
      'test_array',
      'test_scaler',
      'test_array_return',
      'test_map_return',
      'test_expression',
      'asset_info',
      'asset_info_2',
      'myExample'
    ];

    expectedBlocks.forEach(blockName => {
      expect(data).toHaveProperty(blockName);
    });
  });

  it('validates block value types are correct', () => {
    const data = TestUtils.runJSONTest('blocks');

    // Validate data types of each block
    expect(typeof data.test_map).toBe('object');
    expect(Array.isArray(data.test_array)).toBe(true);
    expect(typeof data.test_scaler).toBe('number');
    expect(Array.isArray(data.test_array_return)).toBe(true);
    expect(typeof data.test_map_return).toBe('object');
    expect(typeof data.test_expression).toBe('number');
    expect(typeof data.asset_info).toBe('object');
    expect(typeof data.asset_info_2).toBe('object');
    expect(typeof data.myExample).toBe('object');
  });
});
