// runner.js
// Usage: node runner.js <input>
const fs = require('fs');

// Read user code
const userCode = fs.readFileSync('./user_code.js', 'utf-8');
eval(userCode); // Defines the function in global scope

// Read input from command line (as JSON string)
const input = JSON.parse(process.argv[2]);

// For addTwoNumbers, expects [a, b]
const result = addTwoNumbers(...input);

console.log(JSON.stringify(result)); 