import fs from 'fs';
import path from 'path';
import YAML from 'yaml';
import { evaluateFormula } from './utils/jsonFormula.js';

export class Evaluator {
    constructor() {
        this.profile = null;
    }

    loadProfile(profilePath) {
        console.log(`Loading Trust Profile from: ${profilePath}`);

        const fullPath = path.resolve(profilePath);
        const profileData = fs.readFileSync(fullPath, 'utf-8');
        this.profile = YAML.parseAllDocuments(profileData);
    }

    processOneStatement(statement, jsonData) {
        // there are two types of statements: sections & expression
        //  Sections are informative only
        //  Expressions contain the rules that need to be evaluated against the JSON data

        // If the statement is a section (determined by required `title`)
        // we can log its title and description
        // otherwise it is an expression
        // and we can evaluate it
        if (statement.title) {
            console.log(`\tProcessing: ${statement.title} with ID: ${statement.id}`);
            if (statement.description) {
                console.log(`\t\tDescription: ${statement.description}`);
            }
            if (statement.report_text) {
                console.log(`\t\tReport Text: ${statement.report_text}`);
            }
        } else {
            console.log(`\tProcessing expression with ID: ${statement.id}`);

            if (statement.description) {
                console.log(`\t\tDescription: ${statement.description}`);
            }

            // Here we would evaluate the expression against the JSON data
            const result = evaluateFormula(statement.expression, jsonData);
            console.log(`\t\tResult:`, result);

            // check if there is some report_text to log
            // we convert the boolean result to a string, then look for a match
            if (statement.report_text) {
                if (typeof result === 'boolean') {
                    const reportTextObj = statement.report_text[result ? 'true' : 'false'];
                    if ( typeof reportTextObj === 'object') {
                        const reportText = reportTextObj['en']; // get the english version
                        console.log(`\t\tReport Text: ${reportText}`);
                    } else {
                        console.log(`\t\tNo report text found!`);
                    }
                }
            }
        }
    }

    evaluate(jsonData) {
        if (!this.profile) {
            throw new Error('Trust Profile not loaded. Please load a profile before evaluation.');
        }

        const trustReport = {};

        console.log('Evaluating JSON data against the Trust Profile...');

        // start with the first document in the profile, which contains the metadata
        // name, version, issuer, date and are required fields
        const doc0 = this.profile[0].toJSON();
        const metadata = doc0.metadata;
        trustReport.metadata = metadata; // Store metadata in the report
        const profileInfo = `${metadata.name} (${metadata.version})`;
        console.log(`Evaluating "${profileInfo}" from "${metadata.issuer}" dated ${metadata.date}.`);

        // -1 one for the metadata document
        console.log(`Profile contains ${this.profile.length-1} sections with rules.`);

        for (let i = 1; i < this.profile.length; i++) {
            const section = this.profile[i].toJSON();

            if (Array.isArray(section)) {
                section.forEach((rule, _idx) => {
                    this.processOneStatement(rule, jsonData);
                });
            } else {
                // If the section is not an array, it might be a single rule or a complex structure
                this.processOneStatement(section, jsonData);
            }
        }

        // After processing all sections, we can summarize the results
        return trustReport;
    }
}

export default Evaluator;
