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

import fs from 'fs';
import path from 'path';
import YAML from 'yaml';
import Handlebars from 'handlebars';
import { FormulaRunner } from './utils/jsonFormula.js';
import logger from './utils/logger.js';

export class Evaluator {
  constructor() {
    this.profile = null;
    this.formRunner = new FormulaRunner();
    this.formulaGlobals = {};
  }

  loadProfile(profilePath) {
    console.log(`📄 Loading Trust Profile from: ${profilePath}`);

    const fullPath = path.resolve(profilePath);
    const profileData = fs.readFileSync(fullPath, 'utf-8');
    this.profile = YAML.parseAllDocuments(profileData);
  }

  processOneStatement(statement, jsonData) {
    // there are two types of statements: information & expression
    //  information are informative only
    //  Expressions contain the rules that need to be evaluated against the JSON data

    const statementReport = {};
    statementReport.id = statement.id;
    if (!statementReport.id) {
      throw new Error(`❌ Statement is missing an ID: ${JSON.stringify(statement)}`);
    }

    // If the statement is an information statement
    //      then it does NOT have an expression
    //      and it CAN have a title
    //      we can log its title (if present) and description
    // otherwise it is an expression
    //      and we can evaluate it
    if (!statement.expression) {
      logger.log(`\tProcessing information with ID: ${statement.id}`);

      if (statement.title) {
        logger.log(`\t\tDescription: ${statement.title}`);
        statementReport.title = statement.title;
      }

      // spec says;
      //  "A human readable description of the statement that will not be taken over in associated Trust Reports"
      // if (statement.description) {
      //     logger.log(`\t\tDescription: ${statement.description}`);
      //     statementReport.title = statement.description;
      // }

      if (statement.report_text) {
        let reportText = statement.report_text;

        // see if the report text contains a template
        // if it does, we compile it with Handlebars
        // and pass the jsonData to it
        // otherwise we just use the report text as is
        if (reportText && reportText.includes('{{')) {
          const template = Handlebars.compile(reportText);
          reportText = template(jsonData);
        }

        logger.log(`\t\tReport Text: ${reportText}`);
        statementReport.report_text = reportText;
      } else {
        throw new Error(`❌ Statement is missing report_text: ${JSON.stringify(statement)}`);
      }
    } else {
      logger.log(`\tProcessing expression with ID: ${statement.id}`);

      if (statement.id.startsWith('jpt.')) {
        logger.log(`\t\tSpecial "predefined statement": ${statement.id}`);
        // BOGUS: aborting for now
        // TODO
        // return statementReport;
      }

      // spec says;
      //  "A human readable description of the statement that will not be taken over in associated Trust Reports"
      // if (statement.description) {
      //     logger.log(`\t\tDescription: ${statement.description}`);
      //     statementReport.title = statement.description;
      // }

      // Here we would evaluate the expression against the JSON data
      const result = this.formRunner.run(statement.expression, jsonData, this.formulaGlobals);
      logger.log('\t\tResult:', result);
      statementReport.value = result;

      // store the value in a special entry called "profile" in the original JSON
      // so that it can be found later
      if (!jsonData.profile) {
        jsonData.profile = {};
      }
      jsonData.profile[statement.id] = result;

      // check if there is some report_text to log
      // we convert the boolean result to a string, then look for a match
      if (statement.report_text) {
        if (typeof result === 'boolean') {
          const reportTextObj = statement.report_text[result ? 'true' : 'false'];
          if (typeof reportTextObj === 'object') {
            const repLang = 'en'; // default to English
            let reportText = reportTextObj[repLang];

            // see if the report text contains a template
            // if it does, we compile it with Handlebars
            // and pass the jsonData to it
            // otherwise we just use the report text as is
            if (reportText && reportText.includes('{{')) {
              const template = Handlebars.compile(reportText);
              reportText = template(jsonData);
            }

            logger.log(`\t\tReport Text: ${reportText}`);
            statementReport.report_text = reportText;
          } else {
            logger.log('\t\tNo report text found!');
          }
        }
      } else {
        throw new Error(`❌ Statement is missing report_text: ${JSON.stringify(statement)}`);
      }
    }

    return statementReport;
  }

  evaluate(jsonData) {
    if (!this.profile) {
      throw new Error('❌ Trust Profile not loaded. Please load a profile before evaluation.');
    }

    // need to do this to get access to them inside Handlebars
    const formRunner = this.formRunner;
    const formulaGlobals = this.formulaGlobals;

    // register Handlebars helpers
    // eslint-disable-next-line no-unused-vars
    Handlebars.registerHelper('expr', function (arg1, options) {
      const result = formRunner.run(arg1, jsonData, formulaGlobals);
      return result;
    });

    const trustReport = {};

    // logger.log('🔍 Evaluating JSON data against the Trust Profile...');

    // start with the first document in the profile
    const doc0 = this.profile[0].toJSON();

    // add all fields from the first document to the jsonData
    // this allows the profile to access them later (e.g., in expressions or templates)
    for (const [key, value] of Object.entries(doc0)) {
      jsonData[key] = value;
      // logger.log(`Copying "${key}" to the trust indicators.`);
    }

    // extract the required `metadata` field
    //      name, version, issuer, date and are required fields
    // and add it to the report, as required by the spec
    const metadata = doc0.metadata;
    trustReport.profile_metadata = metadata; // Store metadata in the report
    const profileInfo = `${metadata.name} (${metadata.version})`;
    logger.log(`🔍 Evaluating "${profileInfo}" from "${metadata.issuer}" dated ${metadata.date}.`);

    // load the global variables from the profile
    // and register them as json-formula globals
    // always load these first, since a expression might depend on them
    if (doc0.variables) {
      logger.log('🔍 Registering variables from the profile:');
      for (const [name, value] of Object.entries(doc0.variables)) {
        logger.log(`\t- ${name}: ${value}`);
        // register the global as a variable
        this.formulaGlobals[name] = value;
      }
    }

    // load the expressions from the profile
    // and register them as json-formula functions
    if (doc0.expressions) {
      logger.log('🔍 Registering expressions from the profile:');
      for (const [name, expression] of Object.entries(doc0.expressions)) {
        logger.log(`\t- ${name}: ${expression}`);
        // register the expression as a function
      }
      this.formRunner.registerFunctions(doc0.expressions, doc0.variables);
    }

    // -1 one for the metadata document
    logger.log(`Profile contains ${this.profile.length - 1} sections with rules.`);

    trustReport.sections = [];   // init an array of sections

    for (let i = 1; i < this.profile.length; i++) {
      const section = this.profile[i].toJSON();

      if (Array.isArray(section)) {
        const sectionReport = [];

        // eslint-disable-next-line no-unused-vars
        section.forEach((rule, _idx) => {
          const oneSectRep = this.processOneStatement(rule, jsonData);
          sectionReport.push(oneSectRep);
        });

        trustReport.sections.push(sectionReport);
      } else {
        // If the section is not an array, it might be a single rule or a complex structure
        this.processOneStatement(section, jsonData);
      }
    }

    Handlebars.unregisterHelper('formula');

    // After processing all sections, we can summarize the results
    return trustReport;
  }
}

export default Evaluator;
