// logger.js
// simple logger that understanding if we are running in a test environment
// and will not log in that case
const logger = {
  log: (...args) => {
    if (process.env.NODE_ENV !== 'test' && typeof jest === 'undefined') {
      console.log(...args);
    }
  },
  warn: (...args) => {
    if (process.env.NODE_ENV !== 'test' && typeof jest === 'undefined') {
      console.warn(...args);
    }
  },
  error: (...args) => {
    // You might want errors to always log, even in tests, for visibility
    console.error(...args);
  }
};

export default logger;

