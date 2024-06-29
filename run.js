const r = require('./request.js');


// Access the command-line arguments
const args = process.argv.slice(2); // Remove the first two elements

// Log the arguments to the console
//console.log('Command-line arguments:', args);

// Example usage: node app.js arg1 arg2 arg3
// Output: Command-line arguments: [ 'arg1', 'arg2', 'arg3' ]

// You can process the arguments as needed
args.forEach((arg, index) => {
  console.log(`Argument ${index + 1}: ${arg}`);
});

const concatenatedArgs = args.join(' ');

async function run(arg) {
    try {
      const result = await r.comm(arg);
      console.log('Result:', result);
  
    } catch (error) {
      console.error('Error:', error);
    }
  }
  
run(concatenatedArgs);
  

