const comm = require('./request.js');
const findPath = require('./lambdaman.js');


// Access the command-line arguments
const args = process.argv.slice(2); // Remove the first two elements

// Log the arguments to the console
//console.log('Command-line arguments:', args);

// Example usage: node app.js arg1 arg2 arg3
// Output: Command-line arguments: [ 'arg1', 'arg2', 'arg3' ]

let ac = "";

// You can process the arguments as needed
args.forEach((arg, index) => {
  console.log(`Argument ${index + 1}: ${arg}`);
});

const concatenatedArgs = args.join(' ');

async function lambdasolve(num) {
    try {
  
      const task = "lambdaman" + num
      const result = await comm('get ' + task);
      console.log('Result:', result);
  
      let path = findPath(result)
      console.log('Path:', path);
  
      const result2 = await comm('solve ' + task + ' ' + path);
      console.log('Result:', result2);
  
    } catch (error) {
      console.error('Error:', error);
    }
}

lambdasolve(args[0]);