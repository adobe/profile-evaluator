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

describe('CLI Integration: Expression Indicators', () => {
  /**
   * Validate expression-specific checks based on the expression indicators report
   * @param {Object} data - The parsed JSON/YAML data
   */
  function validateExpressionSpecificChecks(data) {
    // Validate that there are two section groups in statements
    expect(data.statements.length).toBe(2);

    // First section group should have 2 items
    expect(data.statements[0].length).toBe(2);
    // Second section group should have 2 items
    expect(data.statements[1].length).toBe(2);

    // Find and validate the general information section
    const generalInfoSection = TestUtils.findSectionById(data, 'generalInfo');
    expect(generalInfoSection).toBeDefined();
    expect(generalInfoSection.title).toBe('General Information');
    expect(generalInfoSection.report_text).toBe('Report run on Monday');

    // Find and validate the content modification check
    const contentSection = TestUtils.findSectionById(data, 'content');
    expect(contentSection).toBeDefined();
    expect(contentSection.value).toBe(true);
    expect(contentSection.report_text).toBe('This content has not been modified');

    // Find and validate the generative AI section
    const genAISection = TestUtils.findSectionById(data, 'genAI');
    expect(genAISection).toBeDefined();
    expect(genAISection.title).toBe('Generative AI Usage');
    expect(genAISection.report_text).toBe('This section provides information about whether or not the media asset was produced by generative AI.');

    // Find and validate the AIGC check
    const aigcSection = TestUtils.findSectionById(data, 'aigc');
    expect(aigcSection).toBeDefined();
    expect(aigcSection.value).toBe(false);
    expect(aigcSection.report_text).toBe('This media asset was not produced by generative AI');

    // Validate profile metadata
    expect(data.profile_metadata).toBeDefined();
    expect(data.profile_metadata.name).toBe('Experimental Expression Registration Profile');
    expect(data.profile_metadata.issuer).toBe('JPEG Trust Committee');
    expect(data.profile_metadata.version).toBe('2.0.0');
    expect(data.profile_metadata.language).toBe('en');
  }

  it('runs the CLI and produces valid JSON output', () => {
    const data = TestUtils.runJSONTest('expression');

    // Run expression-specific validation checks
    TestUtils.validateSpecificChecks(data, validateExpressionSpecificChecks);
  });

  it('runs the CLI with --yaml and produces valid YAML output', () => {
    const yamlData = TestUtils.runYAMLTest('expression');

    // Run expression-specific validation checks
    TestUtils.validateSpecificChecks(yamlData, validateExpressionSpecificChecks);
  });
});
