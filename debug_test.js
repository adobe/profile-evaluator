// Debug test to isolate the TestUtils issue
const TestUtils = require('./tests/testUtils');

console.log('TestUtils type:', typeof TestUtils);
console.log('TestUtils constructor:', TestUtils.constructor);
console.log('TestUtils prototype:', Object.getOwnPropertyNames(TestUtils));

// Check if this is a class or function
if (typeof TestUtils === 'function') {
  console.log('Static methods:', Object.getOwnPropertyNames(TestUtils));
}

// Try to call the method
try {
  const paths = TestUtils.getTestPaths('camera');
  console.log('Success getting paths:', paths);
} catch (error) {
  console.error('Error getting paths:', error.message);
  console.error('Stack:', error.stack);
}
