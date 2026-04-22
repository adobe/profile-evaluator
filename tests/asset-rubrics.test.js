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

describe('CLI Integration: C2PA Asset Conformance Rubric', () => {
  describe('i2v (image-to-video)', () => {
    let data;

    beforeAll(() => {
      data = TestUtils.runRubricJSONTest('i2v');
    });

    it('produces valid rubric JSON output', () => {
      TestUtils.validateRubricData(data);
    });

    it('has correct rubric metadata', () => {
      expect(data.rubric_metadata.name).toBe('C2PA Asset Conformance 0.2 Spec 2.4 Rubric');
      expect(data.rubric_metadata.issuer).toBe('C2PA Conformance Task Force');
    });

    it('inception action is correctly positioned', () => {
      const section = TestUtils.findSectionById(data, 'validation:inception_action_position');
      expect(section).toBeDefined();
      expect(section.value).toBe(true);
    });

    it('active manifest uses urn:c2pa: prefix', () => {
      const section = TestUtils.findSectionById(data, 'validation:active_manifest_urn');
      expect(section).toBeDefined();
      expect(section.value).toBe(true);
    });

    it('no well-formed structural failures', () => {
      const section = TestUtils.findSectionById(data, 'validation:well_formed_success');
      expect(section).toBeDefined();
      expect(section.value).toBe(true);
      expect(section.report_text).toContain('No structural failures found');
    });

    it('no validation mismatches', () => {
      const section = TestUtils.findSectionById(data, 'validation:valid_success');
      expect(section).toBeDefined();
      expect(section.value).toBe(true);
    });

    it('asset is trusted', () => {
      const section = TestUtils.findSectionById(data, 'validation:trusted_success');
      expect(section).toBeDefined();
      expect(section.value).toBe(true);
    });

    it('mandatory specVersion is missing (expected false for this asset)', () => {
      const section = TestUtils.findSectionById(data, 'validation:mandatory_spec_version');
      expect(section).toBeDefined();
      expect(section.value).toBe(false);
    });

    it('no deprecated assertions', () => {
      const section = TestUtils.findSectionById(data, 'validation:no_deprecated_assertions');
      expect(section).toBeDefined();
      expect(section.value).toBe(true);
    });

    it('no deprecated actions', () => {
      const section = TestUtils.findSectionById(data, 'validation:no_deprecated_actions');
      expect(section).toBeDefined();
      expect(section.value).toBe(true);
    });

    it('thumbnail assertions are correctly located', () => {
      const section = TestUtils.findSectionById(data, 'validation:thumbnail_location');
      expect(section).toBeDefined();
      expect(section.value).toBe(true);
    });

    it('no c2pa.opened actions have digitalSourceType', () => {
      const section = TestUtils.findSectionById(data, 'validation:no_dst_for_opened_action');
      expect(section).toBeDefined();
      expect(section.value).toBe(true);
    });
  });

  describe('capture-non-ai-then-ai-edits', () => {
    let data;

    beforeAll(() => {
      data = TestUtils.runRubricJSONTest('capture-non-ai-then-ai-edits');
    });

    it('produces valid rubric JSON output', () => {
      TestUtils.validateRubricData(data);
    });

    it('inception action is correctly positioned (c2pa.opened first)', () => {
      const section = TestUtils.findSectionById(data, 'validation:inception_action_position');
      expect(section).toBeDefined();
      expect(section.value).toBe(true);
    });

    it('active manifest uses urn:c2pa: prefix', () => {
      const section = TestUtils.findSectionById(data, 'validation:active_manifest_urn');
      expect(section).toBeDefined();
      expect(section.value).toBe(true);
    });

    it('no well-formed structural failures', () => {
      const section = TestUtils.findSectionById(data, 'validation:well_formed_success');
      expect(section).toBeDefined();
      expect(section.value).toBe(true);
    });

    it('asset is trusted', () => {
      const section = TestUtils.findSectionById(data, 'validation:trusted_success');
      expect(section).toBeDefined();
      expect(section.value).toBe(true);
    });

    it('mandatory specVersion is missing (expected false for this asset)', () => {
      const section = TestUtils.findSectionById(data, 'validation:mandatory_spec_version');
      expect(section).toBeDefined();
      expect(section.value).toBe(false);
    });

    it('no deprecated assertions', () => {
      const section = TestUtils.findSectionById(data, 'validation:no_deprecated_assertions');
      expect(section).toBeDefined();
      expect(section.value).toBe(true);
    });

    it('no deprecated actions', () => {
      const section = TestUtils.findSectionById(data, 'validation:no_deprecated_actions');
      expect(section).toBeDefined();
      expect(section.value).toBe(true);
    });

    it('c2pa.opened action has no digitalSourceType', () => {
      const section = TestUtils.findSectionById(data, 'validation:no_dst_for_opened_action');
      expect(section).toBeDefined();
      expect(section.value).toBe(true);
    });

    it('ingredient v3 with activeManifest includes validationResults', () => {
      const section = TestUtils.findSectionById(data, 'validation:ingredient_v3_mandatory_validation_results');
      expect(section).toBeDefined();
      expect(section.value).toBe(true);
    });
  });

  describe('gathered-assertions-test', () => {
    let data;

    beforeAll(() => {
      data = TestUtils.runRubricJSONTest('gathered-assertions-test');
    });

    it('produces valid rubric JSON output', () => {
      TestUtils.validateRubricData(data);
    });

    it('inception action check fails because actions assertion is in gathered_assertions', () => {
      const section = TestUtils.findSectionById(data, 'validation:inception_action_position');
      expect(section).toBeDefined();
      expect(section.value).toBe(false);
    });

    it('active manifest uses urn:c2pa: prefix', () => {
      const section = TestUtils.findSectionById(data, 'validation:active_manifest_urn');
      expect(section).toBeDefined();
      expect(section.value).toBe(true);
    });

    it('no well-formed structural failures', () => {
      const section = TestUtils.findSectionById(data, 'validation:well_formed_success');
      expect(section).toBeDefined();
      expect(section.value).toBe(true);
    });

    it('asset is trusted', () => {
      const section = TestUtils.findSectionById(data, 'validation:trusted_success');
      expect(section).toBeDefined();
      expect(section.value).toBe(true);
    });

    it('mandatory specVersion is missing (expected false for this asset)', () => {
      const section = TestUtils.findSectionById(data, 'validation:mandatory_spec_version');
      expect(section).toBeDefined();
      expect(section.value).toBe(false);
    });

    it('no deprecated assertions', () => {
      const section = TestUtils.findSectionById(data, 'validation:no_deprecated_assertions');
      expect(section).toBeDefined();
      expect(section.value).toBe(true);
    });

    it('thumbnail assertions are correctly located', () => {
      const section = TestUtils.findSectionById(data, 'validation:thumbnail_location');
      expect(section).toBeDefined();
      expect(section.value).toBe(true);
    });

    it('all statements have required report_text', () => {
      const allStatements = data.statements.flat();
      allStatements.forEach(section => {
        expect(section).toHaveProperty('report_text');
        expect(typeof section.report_text).toBe('string');
        expect(section.report_text.length).toBeGreaterThan(0);
      });
    });
  });
});
