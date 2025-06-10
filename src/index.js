import fs from 'fs';
import path from 'path';
import { Evaluator } from './evaluator.js';

// Simple command line parsing
function parseArgs(argv) {
    const args = {};
    let i = 2;
    while (i < argv.length) {
        const arg = argv[i];
        if (arg === '-p' || arg === '--profile') {
            args.profile = argv[++i];
        } else if (arg === '-o' || arg === '--output') {
            args.output = argv[++i];
        } else if (!args.jsonFile) {
            args.jsonFile = arg;
        } else {
            console.error(`Unknown argument: ${arg}`);
            process.exit(1);
        }
        i++;
    }
    return args;
}

const args = parseArgs(process.argv);

if (!args.profile || !args.jsonFile) {
    console.error('Usage: node index.js -p <path_to_jpeg_trust_profile> [-o <output_directory>] <path_to_json_file>');
    process.exit(1);
}

const profilePath = args.profile;
const jsonFilePath = args.jsonFile;
const outputDir = args.output;

const evaluator = new Evaluator();

async function main() {
    try {
        await evaluator.loadProfile(profilePath);

        console.log(`Loading Trust Indicator Set from: ${jsonFilePath}`);
        const jsonData = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));
        const result = evaluator.evaluate(jsonData);

        if (outputDir) {
            if (!fs.existsSync(outputDir)) {
                fs.mkdirSync(outputDir, { recursive: true });
            }
            const outputPath = path.join(outputDir, 'evaluation_result.json');
            fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
            console.log(`Evaluation result written to ${outputPath}`);
        } else {
            console.log('Evaluation Result:', result);
        }
    } catch (error) {
        console.error('Error:', error.message);
    }
}

main();