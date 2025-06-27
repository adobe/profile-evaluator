import jsonFormula from '@adobe/json-formula';

class FormulaRunner {
    constructor(customFunctions = null) {
        this.myFormula = customFunctions ? new jsonFormula(customFunctions) : new jsonFormula();
    }

    run(formula, data, globals = {}) {
        try {
            // Clean up the formula by removing any leading/trailing whitespace
            formula = formula.trim();
            
            // Use search method which is the preferred method over run
            const result = this.myFormula.search(formula, data, globals);
            return result;
        } catch (error) {
            console.error('Error in FormulaRunner.run:', error);
            throw error;
        }
    }

    registerFunctions(functionsObject, globals = {}) {
        try {
            for (const [name, code] of Object.entries(functionsObject)) {
                const regFormula = 'register("' + name + '", &' + code + ')';
                this.run( regFormula, {}, globals); // Run the registration formula with empty data and globals  
            }
        } catch (error) {
            console.error('Error in FormulaRunner.registerFunctions:', error);
            throw error;
        }
    }
}

export function evaluateFormula(formula, data) {
    // Implementation for applying the parsed formula to the JSON data

    const myFormula = new jsonFormula();

    // clean up the formula by removing any leading/trailing whitespace
    formula = formula.trim();
    const dbg = [];
    const compiledFormula = myFormula.compile(formula, [], dbg);

    // now evaluate the formula against the data
    // NOTE: search is the same as run, but search is the preferred method
    try {
        const language = 'en-US'; // default language
        const globals = {};
        const result = myFormula.run(compiledFormula, data, language, globals);
        // console.log('Evaluation Result:', result);
        return result;
    } catch (error) {
        console.error('Error in evaluateFormula:', error);
        throw error;
    }
}


export function evaluateFormulaViaSearch(formula, data) {
    // Implementation for applying the parsed formula to the JSON data using FormulaRunner

    const customFunctions = {
      customFunc: {
        _func: (_args, _searchData, interpreter) => 42,
        _signature: [],
      },
    };
    
    const runner = new FormulaRunner(customFunctions);
    
    const globals = {$foo : true, $bar : 42, $baz : 'hello', $arr : [1, 2, 3], "$days": [
       "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    };
    
    return runner.run(formula, data, globals);
}

export { FormulaRunner };

