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

describe('CLI Integration: Signature Indicators', () => {
  /**
   * Validate signature-specific checks
   * @param {Object} data - The parsed JSON/YAML data
   */
  function validateSignatureSpecificChecks(data) {
    // Test validity date checks (section1)
    const section1 = data.sections[0];
    const notBeforeCheck = section1.find(item => item.id === 'not_before');
    const notAfterCheck = section1.find(item => item.id === 'not_after');

    expect(notBeforeCheck).toBeDefined();
    expect(notBeforeCheck.value).toBe(true);
    expect(notBeforeCheck.report_text).toContain('not_before');

    expect(notAfterCheck).toBeDefined();
    expect(notAfterCheck.value).toBe(true);
    expect(notAfterCheck.report_text).toContain('not_after');

    // Test issuer trust validation (section2)
    const section2 = data.sections[1];
    const testCertCheck = section2.find(item => item.id === 'test_cert');
    const issuerCheck = section2.find(item => item.id === 'issuer');

    expect(testCertCheck).toBeDefined();
    expect(testCertCheck.value).toBe(true);
    expect(testCertCheck.report_text).toContain('test certificate');

    expect(issuerCheck).toBeDefined();
    expect(issuerCheck.value).toBe(false);
    expect(issuerCheck.report_text).toContain('not trusted');

    // Test overall profile compliance (section3)
    const section3 = data.sections[2];
    const complianceCheck = section3.find(item => item.id === 'jpt:profile_compliance');

    expect(complianceCheck).toBeDefined();
    expect(complianceCheck.value).toBe(false);
    expect(complianceCheck.report_text).toContain('not signed with a trusted certificate');
  }

  it('runs the CLI and produces valid JSON output', () => {
    const data = TestUtils.runJSONTest('signature');

    // Run signature-specific validation checks
    TestUtils.validateSpecificChecks(data, validateSignatureSpecificChecks);
  });

  it('runs the CLI with --yaml and produces valid YAML output', () => {
    const yamlData = TestUtils.runYAMLTest('signature');

    // Run signature-specific validation checks
    TestUtils.validateSpecificChecks(yamlData, validateSignatureSpecificChecks);
  });
});
