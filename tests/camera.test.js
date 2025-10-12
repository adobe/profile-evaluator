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

describe('CLI Integration: Camera Indicators', () => {
  /**
   * Validate camera-specific checks based on the camera indicators report
   * @param {Object} data - The parsed JSON/YAML data
   */
  function validateCameraSpecificChecks(data) {
    // Find and validate the metadata output section
    const metadataSection = TestUtils.findSectionById(data, 'metadata-output');
    expect(metadataSection).toBeDefined();
    expect(metadataSection.report_text).toContain('This is a sample camera profile for testing purposes - 1234567890');

    // Find and validate the general information section
    const generalInfoSection = TestUtils.findSectionById(data, 'generalInfo');
    expect(generalInfoSection).toBeDefined();
    expect(generalInfoSection.title).toBe('General Information');
    expect(generalInfoSection.report_text).toBe('This section provides information about general stuff');

    // Find and validate the content modification check
    const contentSection = TestUtils.findSectionById(data, 'content');
    expect(contentSection).toBeDefined();
    expect(typeof contentSection.value).toBe('boolean');
    expect(contentSection.report_text).toContain('content has');

    // Find and validate the declaration only check
    const declarationSection = TestUtils.findSectionById(data, 'declaration_only');
    expect(declarationSection).toBeDefined();
    expect(typeof declarationSection.value).toBe('boolean');
    expect(declarationSection.report_text).toContain('modifications');

    // Find and validate the location information section
    const locationSection = TestUtils.findSectionById(data, 'location');
    expect(locationSection).toBeDefined();
    expect(locationSection.title).toBe('Location Information');
    expect(locationSection.report_text).toBe('This section provides information about where the image was taken');

    // Find and validate the GPS check
    const gpsSection = TestUtils.findSectionById(data, 'gps');
    expect(gpsSection).toBeDefined();
    expect(typeof gpsSection.value).toBe('boolean');
    expect(gpsSection.report_text).toContain('GPS information shows');
    expect(gpsSection.report_text).toContain('China');

    // Find and validate the city check
    const citySection = TestUtils.findSectionById(data, 'city');
    expect(citySection).toBeDefined();
    expect(typeof citySection.value).toBe('boolean');
    expect(citySection.report_text).toContain('city');
    expect(citySection.report_text).toContain('China');
  }

  it('runs the CLI and produces valid JSON output', () => {
    const data = TestUtils.runJSONTest('camera');

    // Run camera-specific validation checks
    TestUtils.validateSpecificChecks(data, validateCameraSpecificChecks);
  });

  it('runs the CLI with --yaml and produces valid YAML output', () => {
    const yamlData = TestUtils.runYAMLTest('camera');

    // Run camera-specific validation checks
    TestUtils.validateSpecificChecks(yamlData, validateCameraSpecificChecks);
  });
});
