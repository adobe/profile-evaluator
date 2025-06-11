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
        if (statement.title) {
            console.log(`Processing: ${statement.title} with ID: ${statement.id}`);
            if (statement.description) {
                console.log(`Description: ${statement.description}`);
            }
            if (statement.report_text) {
                console.log(`Report Text: ${statement.report_text}`);
            }
        } 
        // otherwise it is an expression
        // and we can evaluate it
        else {
            console.log(`Processing expression with ID: ${statement.id}`);

            if (statement.description) {
                console.log(`Description: ${statement.description}`);
            }

            // Here we would evaluate the expression against the JSON data
            const result = evaluateFormula(statement.expression, jsonData);
            console.log(`Result for expression ${statement.id}:`, result);
        }
    }

    evaluate(jsonData) {
        if (!this.profile) {
            throw new Error('Trust Profile not loaded. Please load a profile before evaluation.');
        }

        console.log('Evaluating JSON data against the Trust Profile...');
        
        // for (const doc of this.profile) {
        //     console.log(doc.toJSON());
        // }

        // start with the first document in the profile, which contains the metadata
        // name, version, issuer, date and are required fields
        const doc0 = this.profile[0].toJSON();
        const metadata = doc0.metadata;
        console.log(`Evaluating "${metadata.name} (${metadata.version})" from ${metadata.issuer} dated ${metadata.date}.`);

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

        const results = {};

        // for (const rule of this.profile.rules) {
        //     const formula = rule.formula;
        //     results[rule.name] = jsonFormula.evaluateFormula(formula, jsonData);
        // }

        return results;
    }
}

export default Evaluator;