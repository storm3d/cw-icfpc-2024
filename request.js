const https = require('https');
const fs = require('fs');
const findPath = require('./lambdaman.js');

module.exports = findPath;


// Load the token from a file
const token = fs.readFileSync('auth_token.txt', 'utf8').trim();

function decodeToken(encodedToken) {
  if(encodedToken[0] === 'S')
    return decodeString(encodedToken.slice(1))
  else 
    return 'Invalid token';
  
}

function decodeString(encodedBody) {
  const customOrder = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!"#$%&\'()*+,-./:;<=>?@[\\]^_`|~ \n';
  
  // Create a map from the ICFP character order to regular characters
  let decodeMap = {};
  for (let i = 33; i <= 126; i++) {
    decodeMap[String.fromCharCode(i)] = customOrder[i - 33];
  }

  // Correctly map the space character
  //decodeMap[' '] = ' ';

  // Decode the string
  let decodedString = '';
  for (let char of encodedBody) {
    if(decodeMap[char] === undefined) {
      //decodedString += ' '; // Assuming undefined characters are spaces, adjust if needed
    } else {
      decodedString += decodeMap[char];
    }
  }

  return decodedString;
}

function encodeString(inputString) {
  const customOrder = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!"#$%&\'()*+,-./:;<=>?@[\\]^_`|~ \n';
  
  // Create a map from regular characters to the ICFP character order
  let encodeMap = {};
  for (let i = 0; i < customOrder.length; i++) {
    encodeMap[customOrder[i]] = String.fromCharCode(33 + i);
  }
  
  // Add space character mapping directly to space (ASCII 32) if required
  // Remove this line if you do not want to include spaces at all in your encoded strings
  //encodeMap[' '] = '}'; // This maps space to space; adjust or remove if space should be encoded differently

  // Encode the string
  let encodedString = '';
  for (let char of inputString) {
    if (encodeMap[char] === undefined) {
      throw new Error('Character ' + char + ' cannot be encoded');
    } else {
      encodedString += encodeMap[char];
    }
  }

  return "S" + encodedString;
}

async function comm(raw) {
  const data = encodeString(raw);
  const host = 'boundvariable.space';
  const url = '/communicate';

  const options = {
    hostname: host,
    path: url,
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain',
      'Content-Length': Buffer.byteLength(data),
      'Authorization': `Bearer ${token}`
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let responseBody = '';

      res.on('data', (chunk) => {
        responseBody += chunk;
      });

      res.on('end', () => {
        if (res.statusCode !== 200) {
          reject(new Error(`Request Failed. Status Code: ${res.statusCode}`));
        } else {
          try {
            const decoded = decodeToken(responseBody);
            resolve(decoded);
          } catch (e) {
            reject(e);
          }
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

async function lambdamanlist(num) {
  try {
    const result = await comm('get lambdaman');
    console.log('Result:', result);

  } catch (error) {
    console.error('Error:', error);
  }
}

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

// Call the main function
lambdasolve(8);
//lambdamanlist();


