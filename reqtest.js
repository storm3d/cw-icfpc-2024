const http = require('http'); // Use 'https' if your server is on HTTPS.
const token = '00000000-0000-0000-0000-000000000000'; // Use your actual bearer token.

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
  

async function comm(data) {

    const options = {
    hostname: '45.33.61.46',
    port: 8000,
    path: '/communicate',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json', // Ensures your content type is application/json
        'Content-Length': Buffer.byteLength(data),
        'Authorization': `Bearer ${token}`
    }
    };

    const req = http.request(options, (res) => {
    console.log(`Status Code: ${res.statusCode}`);

    res.on('data', (d) => {
        process.stdout.write(d);
        console.log('Response:', decodeToken(d.toString()));
    });
    });

    req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
    });

    // Write data to request body
    req.write(data);
    req.end();
}

//comm(encodeString("get index"));
comm('B$ L" B+ v" I" I#')