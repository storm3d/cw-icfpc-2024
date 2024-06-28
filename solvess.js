const r = require('./request.js');
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
  //console.log(`Argument ${index + 1}: ${arg}`);
});

const concatenatedArgs = args.join(' ');

async function solvess(num) {
    try {
  
      const task = "spaceship" + num
      const result = await r.comm('get ' + task);
      console.log('Returned:', result);
  
      
      let path = '31619';// r.encodeString('236659')
      console.log('Path:', path);
        

      const result2 = await r.comm('solve ' + task + ' ' + path);
      console.log('Returned:', result2);
  
    } catch (error) {
      console.error('Error:', error);
    }
}

solvess(args[0]);