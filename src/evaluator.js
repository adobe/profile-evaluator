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

  processOneDataBlock(dataBlock, jsonData) {
    function processOneItem(item, jsonData) {
      let outValue = item;
      if (typeof item === 'string') {
        item = item.trim();
        if (item.startsWith('{{') && item.endsWith('}}')) {
          // If the value is a Handlebars template, compile it
          // and pass the jsonData to it
          const template = Handlebars.compile(item, { noEscape: true });
          outValue = template(jsonData);
        }
      }

      // Try to convert outValue to a boolean or number if possible
      if (typeof outValue === 'string') {
        const lower = outValue.toLowerCase();
        if (lower === 'true') return true;
        if (lower === 'false') return false;
        const num = Number(outValue);
        if (!isNaN(num) && outValue.trim() !== '') return num;
      }
      // Try to parse as JSON object or array
      try {
        const parsed = JSON.parse(outValue);
        if (typeof parsed === 'object' && parsed !== null) {
          // If any child of parsed is a string, process it through processOneItem to handle expressions
          if (Array.isArray(parsed)) {
            return parsed.map(child =>
              typeof child === 'string' ? processOneItem(child, jsonData) : child
            );
          } else if (typeof parsed === 'object' && parsed !== null) {
            for (const key in parsed) {
              if (typeof parsed[key] === 'string') {
                parsed[key] = processOneItem(parsed[key], jsonData);
              }
            }
            return parsed;
          }
          return parsed;
        }
      } catch (e) {
        // Not valid JSON, ignore
      }

      return outValue;
    }

    // This function processes a single data block
    if (typeof dataBlock === 'object' && dataBlock !== null) {
      const output = {};
      if (dataBlock.block) {
        const input = dataBlock.block;
        logger.log(`\tProcessing data block with name: ${input.name}`);

        if (Array.isArray(input.value)) {
          output[input.name] = input.value.map(item => {
            return processOneItem(item, jsonData);
          });
        } else if (typeof input.value === 'object' && input.value !== null) {
          output[input.name] = {};
          for (const [key, value] of Object.entries(input.value)) {
            if (key !== 'name') {
              let outValue = processOneItem(value, jsonData);
              output[input.name][key] = outValue;
            }
          }
        } else {
          output[input.name] = {};
          let outValue = processOneItem(input.value, jsonData);
          output[input.name] = outValue;
        }

        return output;
      }
    }
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

  evaluate(jsonData, profilePath) {
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
      if (typeof result === 'object' && result !== null) {
        return new Handlebars.SafeString(JSON.stringify(result));
      } else {
        return result;
      }
    });

    // register a custom function to convert a JSON object to a string
    // we use the Handlebars SafeString to avoid escaping
    // eslint-disable-next-line no-unused-vars
    Handlebars.registerHelper('str', function (arg1, options) {
      const result = JSON.stringify(arg1);
      return new Handlebars.SafeString(result);
    });

    // this is a special helper that gets called when a helper is missing or key is not defined
    Handlebars.registerHelper('helperMissing', function ( /* dynamic arguments */) {
      var options = arguments[arguments.length - 1];
      var args = Array.prototype.slice.call(arguments, 0, arguments.length - 1);
      return new Handlebars.SafeString('🔴 Missing: ' + options.name + '(' + args + ')');
    });

    // we don't use this - it was used for debugging
    // Handlebars.registerHelper('eq', function (arg1, arg2, options) {
    //   return (arg1 === arg2) ? options.fn(this) : options.inverse(this);
    // });

    const trustReport = {};

    // logger.log('🔍 Evaluating JSON data against the Trust Profile...');

    // start with the first document in the profile
    const doc0 = this.profile[0].toJSON();

    // Check for 'include' field in doc0
    if (Array.isArray(doc0.include)) {
      for (const includePath of doc0.include) {
        // Resolve path relative to the profile file if not absolute
        const resolvedPath = path.isAbsolute(includePath)
          ? includePath
          : path.resolve(path.dirname(profilePath), includePath);

        if (fs.existsSync(resolvedPath)) {
          try {
            const includeData = fs.readFileSync(resolvedPath, 'utf-8');
            const includeDocs = YAML.parseAllDocuments(includeData);
            // Merge the first included document with doc0, combining fields with the same key
            if (includeDocs.length > 0) {
              const includeDoc0 = includeDocs[0].toJSON();
              for (const [key, value] of Object.entries(includeDoc0)) {
                if (Object.prototype.hasOwnProperty.call(doc0, key)) {
                  // If both are objects, merge their properties
                  if (typeof doc0[key] === 'object' && typeof value === 'object' && doc0[key] !== null && value !== null) {
                    doc0[key] = { ...doc0[key], ...value };
                  } else {
                    // Otherwise, overwrite with the included value
                    doc0[key] = value;
                  }
                } else {
                  doc0[key] = value;
                }
              }
              // Add remaining included documents (if any) to this.profile
              if (includeDocs.length > 1) {
                this.profile.push(...includeDocs.slice(1));
              }
            }
            logger.log(`🔗 Included profile loaded from: ${resolvedPath}`);
          } catch (err) {
            logger.log(`❌ Failed to load included profile: ${resolvedPath} (${err.message})`);
          }
        } else {
          logger.log(`❌ Included profile not found: ${resolvedPath}`);
        }
      }
    }

    // add all fields from the first document to the jsonData
    // this allows the profile to access them later (e.g., in expressions or templates)
    // do this AFTER we merge in includes!
    for (const [key, value] of Object.entries(doc0)) {
      jsonData[key] = value;
      // logger.log(`Copying "${key}" to the trust indicators.`);
    }

    // extract the required `metadata` field
    //   THIS IS NOT LONGER AUTOMATICALLY DONE!!
    //      name, version, issuer, date and are required fields
    // and add it to the report, as required by the spec
    const metadata = doc0.metadata || doc0.profile_metadata;
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

    let theStatements = [];   // init an array of statements

    for (let i = 1; i < this.profile.length; i++) {
      const section = this.profile[i].toJSON();

      if (Array.isArray(section)) {
        const sectionReport = [];

        // eslint-disable-next-line no-unused-vars
        section.forEach((rule, _idx) => {
          if (!rule.id) {
            const oneDataBlock = this.processOneDataBlock(rule, jsonData);
            // Up-level each key in oneDataBlock to trustReport
            if (oneDataBlock && typeof oneDataBlock === 'object') {
              for (const [key, value] of Object.entries(oneDataBlock)) {
                trustReport[key] = value;

                // store the value in a special entry called "profile" in the original JSON
                // so that it can be found later
                if (!jsonData.profile) {
                  jsonData.profile = {};
                }
                jsonData.profile[key] = value;

              }
            }
          } else {
            const oneSectRep = this.processOneStatement(rule, jsonData);
            sectionReport.push(oneSectRep);
          }
        });

        if (sectionReport.length > 0) {
          theStatements.push(sectionReport);
        }
      } else {
        // If the section is not an array, it might be a single rule or a complex structure
        this.processOneStatement(section, jsonData);
      }
    }

    // statements added to trustReport
    trustReport.statements = theStatements;

    // Store metadata in the report (do this after processing data blocks to avoid conflicts)
    // trustReport.profile_metadata = metadata;

    // unregister Handlebars helpers
    Handlebars.unregisterHelper('expr');
    Handlebars.unregisterHelper('str');
    Handlebars.unregisterHelper('helperMissing');

    // After processing all statements, we can summarize the results
    return trustReport;
  }
}

export default Evaluator;
