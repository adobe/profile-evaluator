const TestUtils = require('./testUtils');

describe('Debug CLI Eval', () => {
  const TEST_DATA_FILE = 'testfiles/camera_indicators.json';

  test('debug nested property access', () => {
    const result = TestUtils.runCLIEval([TEST_DATA_FILE, '--eval', "declaration.'claim.v2'.alg"]);
    console.log('Exit code:', result.exitCode);
    console.log('Stdout length:', result.stdout.length);
    console.log('Stdout:', JSON.stringify(result.stdout));
    console.log('Stderr:', JSON.stringify(result.stderr));

    if (result.exitCode === 0 && result.stdout) {
      try {
        const lines = result.stdout.split('\n');
        console.log('Lines:', lines.map((line, i) => `${i}: ${JSON.stringify(line)}`));
      } catch (e) {
        console.log('Error parsing output:', e.message);
      }
    }

    // Don't assert anything, just debug
  });
});
