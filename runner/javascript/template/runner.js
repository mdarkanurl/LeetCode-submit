// runner.js
// Usage: node runner.js <input>
const fs = require('fs');

// Read user code
let userCode = fs.readFileSync('./user_code.js', 'utf-8');

// Read function name
const functionName = fs.readFileSync('./function_name.txt', 'utf-8').trim();

// Replace function declaration with assignment to global
const funcPattern = new RegExp(`function\\s+${functionName}\\s*\\(`);
if (funcPattern.test(userCode)) {
  userCode = userCode.replace(
    funcPattern,
    `global.${functionName} = function(`
  );
}
eval(userCode);

// Read input from command line (as JSON string)
const input = JSON.parse(process.argv[2]);

// Call the function dynamically from global scope
const result = global[functionName](...input);

console.log(JSON.stringify(result)); 