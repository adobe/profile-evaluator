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

describe('CLI Integration: GenAI Indicators', () => {
  /**
   * Validate genai-specific checks
   * @param {Object} data - The parsed JSON/YAML data
   */
  function validateGenAISpecificChecks(data) {
    // Test content modification check (section1)
    const section1 = data.statements[0];
    const contentCheck = section1.find(item => item.id === 'content');

    expect(contentCheck).toBeDefined();
    expect(contentCheck.value).toBe(true);
    expect(contentCheck.report_text).toContain('not been modified');

    // Test generative AI detection (section2)
    const section2 = data.statements[1];
    const aigcCheck = section2.find(item => item.id === 'aigc');
    const declarationOnlyCheck = section2.find(item => item.id === 'declaration_only');

    expect(aigcCheck).toBeDefined();
    expect(aigcCheck.value).toBe(true);
    expect(aigcCheck.report_text).toContain('produced by generative AI');

    expect(declarationOnlyCheck).toBeDefined();
    expect(declarationOnlyCheck.value).toBe(true);
    expect(declarationOnlyCheck.report_text).toContain('No modifications took place');

    // Test overall profile compliance (section3)
    const section3 = data.statements[2];
    const complianceCheck = section3.find(item => item.id === 'jpt:profile_compliance');

    expect(complianceCheck).toBeDefined();
    expect(complianceCheck.value).toBe(true);
    expect(complianceCheck.report_text).toContain('Compliance Status: true');
  }

  it('runs the CLI and produces valid JSON output', () => {
    const data = TestUtils.runJSONTest('genai');

    // Run genai-specific validation checks
    TestUtils.validateSpecificChecks(data, validateGenAISpecificChecks);
  });

  it('runs the CLI with --yaml and produces valid YAML output', () => {
    const yamlData = TestUtils.runYAMLTest('genai');

    // Run genai-specific validation checks
    TestUtils.validateSpecificChecks(yamlData, validateGenAISpecificChecks);
  });
});
