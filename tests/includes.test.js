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

describe('CLI Integration: Includes Profile', () => {
  /**
   * Validate includes-specific checks based on the includes indicators report
   * @param {Object} data - The parsed JSON/YAML data
   */
  function validateIncludesSpecificChecks(data) {
    // Validate that the profile metadata includes data from included files
    expect(data.profile_metadata).toBeDefined();
    expect(data.profile_metadata.name).toBe('Testing Profile');
    expect(data.profile_metadata.issuer).toBe('JPEG Trust Committee');
    expect(data.profile_metadata.version).toBe('2.0.0');
    expect(data.profile_metadata.language).toBe('en');

    // Validate metadata from included file (includeMe.yml)
    expect(data.profile_metadata.didThisWork).toBe(true);
    expect(data.profile_metadata.aNumber).toBe(12345);

    // Find and validate the general information section
    const generalInfoSection = TestUtils.findSectionById(data, 'generalInfo');
    expect(generalInfoSection).toBeDefined();
    expect(generalInfoSection.title).toBe('General Information');
    expect(generalInfoSection.report_text).toBe('This section provides information about general stuff');

    // Find and validate the metadata output section with template rendering
    const metadataSection = TestUtils.findSectionById(data, 'metadata-output');
    expect(metadataSection).toBeDefined();
    expect(metadataSection.report_text).toBe('This is a sample camera profile for testing purposes - 1234567890');

    // Find and validate the content modification check from included file
    const contentSection = TestUtils.findSectionById(data, 'content');
    expect(contentSection).toBeDefined();
    expect(typeof contentSection.value).toBe('boolean');
    expect(contentSection.value).toBe(true);
    expect(contentSection.report_text).toBe('This content has not been modified');

    // Validate that we have exactly 3 statement groups
    expect(data.statements).toHaveLength(3);

    // Validate the structure of each statement group
    expect(data.statements[0]).toHaveLength(1); // generalInfo section
    expect(data.statements[1]).toHaveLength(1); // metadata-output section  
    expect(data.statements[2]).toHaveLength(1); // content section

    // Test specific includes functionality - ensure expressions from included file work
    const contentCheck = data.statements[2][0];
    expect(contentCheck.id).toBe('content');
    expect(contentCheck.value).toBe(true);

    // Validate that handlebars template rendering worked correctly
    // The template "{{foo:sample.description}} - {{foo:sample.number}}" should be rendered
    // using data from the included file
    const templateOutput = data.statements[1][0];
    expect(templateOutput.id).toBe('metadata-output');
    expect(templateOutput.report_text).toContain('This is a sample camera profile for testing purposes');
    expect(templateOutput.report_text).toContain('1234567890');
  }

  /**
   * Additional validation for includes-specific functionality
   * @param {Object} data - The parsed JSON/YAML data
   */
  function validateIncludesMetadataMerging(data) {
    // Test that metadata from main profile and included file are properly merged
    const metadata = data.profile_metadata;

    // From main profile
    expect(metadata.name).toBe('Testing Profile');
    expect(metadata.issuer).toBe('JPEG Trust Committee');
    expect(metadata.date).toBe('2025-06-17T22:44:49.717Z');
    expect(metadata.version).toBe('2.0.0');
    expect(metadata.language).toBe('en');

    // From included file (includeMe.yml)
    expect(metadata.didThisWork).toBe(true);
    expect(metadata.aNumber).toBe(12345);
  }

  /**
   * Validate that expressions from included files are processed correctly
   * @param {Object} data - The parsed JSON/YAML data
   */
  function validateIncludedExpressions(data) {
    // The content check uses an expression (_isUnmodified) defined in includeMe.yml
    const contentSection = TestUtils.findSectionById(data, 'content');
    expect(contentSection).toBeDefined();

    // The expression evaluates content_status == "assertion.dataHash.match"
    // Based on the indicators data, this should be true
    expect(contentSection.value).toBe(true);
    expect(contentSection.report_text).toBe('This content has not been modified');
  }

  /**
   * Validate template/handlebars rendering from included data
   * @param {Object} data - The parsed JSON/YAML data  
   */
  function validateTemplateRendering(data) {
    const metadataSection = TestUtils.findSectionById(data, 'metadata-output');
    expect(metadataSection).toBeDefined();

    // Template: "{{foo:sample.description}} - {{foo:sample.number}}"
    // Should render with data from includeMe.yml
    const expectedText = 'This is a sample camera profile for testing purposes - 1234567890';
    expect(metadataSection.report_text).toBe(expectedText);
  }

  it('runs the CLI and produces valid JSON output', () => {
    const data = TestUtils.runJSONTest('includes');

    // Run includes-specific validation checks
    TestUtils.validateSpecificChecks(data, validateIncludesSpecificChecks);
  });

  it('runs the CLI with --yaml and produces valid YAML output', () => {
    const yamlData = TestUtils.runYAMLTest('includes');

    // Run includes-specific validation checks
    TestUtils.validateSpecificChecks(yamlData, validateIncludesSpecificChecks);
  });

  it('correctly merges metadata from included files', () => {
    const data = TestUtils.runJSONTest('includes');
    validateIncludesMetadataMerging(data);
  });

  it('processes expressions from included files correctly', () => {
    const data = TestUtils.runJSONTest('includes');
    validateIncludedExpressions(data);
  });

  it('renders templates with data from included files', () => {
    const data = TestUtils.runJSONTest('includes');
    validateTemplateRendering(data);
  });

  it('maintains proper section ordering with includes', () => {
    const data = TestUtils.runJSONTest('includes');

    // Validate the order of sections matches the profile structure
    expect(data.statements[0][0].id).toBe('generalInfo');
    expect(data.statements[1][0].id).toBe('metadata-output');
    expect(data.statements[2][0].id).toBe('content');
  });
});
