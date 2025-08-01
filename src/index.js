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
import { Command } from 'commander';
import { Evaluator } from './evaluator.js';
import { FormulaRunner } from './utils/jsonFormula.js';

// Command line parsing with Commander.js
const program = new Command();

program
  .name('profile-evaluator')
  .description('A command line tool to evaluate Trust Indicator Sets data against Trust Profiles.')
  .version('1.1.0')
  .argument('<jsonFile>', 'path to the Trust Indicator Set to evaluate')
  .option('-p, --profile <path>', 'path to Trust Profile')
  .option('-e, --eval <expression>', 'JSON formula expression to evaluate against the data')
  .option('-o, --output <directory>', 'output directory for reports')
  .option('-y, --yaml', 'output report in YAML format, default')
  .option('-j, --json', 'output report in JSON format')
  .option('--html <path>', 'path to HTML template for HTML report output');

program.parse();

const options = program.opts();
const args = program.args;

const profilePath = options.profile;
const evalExpression = options.eval;
const jsonFilePath = args[0];
const outputDir = options.output;

// Validate that either profile or eval is provided, but not both
if (!profilePath && !evalExpression) {
  console.error('❌ Error: Either --profile or --eval option must be provided');
  process.exit(1);
}

if (profilePath && evalExpression) {
  console.error('❌ Error: Cannot use both --profile and --eval options together');
  process.exit(1);
}

const evaluator = new Evaluator();

async function main() {
  try {
    console.log(`🤝 Loading Trust Indicator Set from: ${jsonFilePath}`);
    const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));

    let result;

    if (evalExpression) {
      // Use FormulaRunner to evaluate the expression against the data
      console.log(`🔍 Evaluating expression: ${evalExpression}`);
      const formulaRunner = new FormulaRunner();
      result = formulaRunner.run(evalExpression, jsonData);

      // Output result to stdout
      console.log(JSON.stringify(result, null, 2));
      return;
    } else {
      // Use the existing profile evaluation logic
      await evaluator.loadProfile(profilePath);
      result = evaluator.evaluate(jsonData);
    }

    if (outputDir) {
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      const inputFileName = path.basename(jsonFilePath, path.extname(jsonFilePath));

      if (options.html) {
        const htmlReport = fs.readFileSync(options.html, 'utf-8');
        const htmlOutputPath = path.join(outputDir, `${inputFileName}_report.html`);

        // process the HTML template with Handlebars
        const template = Handlebars.compile(htmlReport);
        const outReport = template(result);
        fs.writeFileSync(htmlOutputPath, outReport);
        console.log(`📝 HTML report written to ${htmlOutputPath}`);
      } else if (options.json) {
        const ext = 'json';
        const outputPath = path.join(outputDir, `${inputFileName}_report.${ext}`);
        fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
        console.log(`📝 JSON result written to ${outputPath}`);
      } else {
        const ext = 'yml';
        const outputPath = path.join(outputDir, `${inputFileName}_report.${ext}`);
        fs.writeFileSync(outputPath, YAML.stringify(result, null, { 'collectionStyle': 'block' }));
        console.log(`📝 YAML result written to ${outputPath}`);
      }
    } else {
      console.log('📈 Evaluation Result:', result);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
