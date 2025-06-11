import jsonFormula from '@adobe/json-formula';

export function evaluateFormula(formula, data) {
    // Implementation for applying the parsed formula to the JSON data

    const myFormula = new jsonFormula();

    // clean up the formula by removing any leading/trailing whitespace
    formula = formula.trim();
    const dbg = [];
    const compiledFormula = myFormula.compile(formula, [], dbg);

    // now evaluate the formula against the data
    try {
        const globals = {};
        const result = myFormula.run(compiledFormula, data, globals);
        console.log('Evaluation Result:', result);
        return result;
    } catch (error) {
        console.error('Error in evaluateFormula:', error);
        throw error;
    }
}
