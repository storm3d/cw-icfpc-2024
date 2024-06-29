const eval = require('./eval.js');
const assert = require('assert');

function runTest(description, input, expected) {
    let actual;
    try {
        const expr = eval.parse(input);
        actual = eval.evaluate(expr);
        assert(actual === expected, `${description}: Expected ${expected}, got ${actual}`);
        console.log(`Passed: ${description}`);
    } catch (error) {
        //console.error(`Failed: ${description}\nError: ${error.message}\nExpected: ${expected}\nActual: ${actual}`);
        console.error('Failed:', `${description}: Expected ${expected}, got ${actual}`);
    }
}

function runBinaryTest(description, operator, operand1, operand2, expected) {
    try {
        const result = evaluateBinary(operator, operand1, operand2);
        console.assert(result === expected, `Test failed: ${description}. Expected ${expected}, got ${result}`);
        console.log(`Passed: ${description}`);
    } catch (error) {
        console.error(`Failed: ${description}. Error: ${error.message}`);
    }
}

function evaluateBinary(operator, operand1, operand2) {
    switch (operator) {
        case '+':
            return operand1 + operand2;
        case '-':
            return operand1 - operand2;
        case '*':
            return operand1 * operand2;
        case '/':
            return Math.trunc(operand1 / operand2);
        case '%':
            return operand1 % operand2;
        case '<':
            return operand1 < operand2;
        case '>':
            return operand1 > operand2;
        case '=':
            return operand1 === operand2;
        case '|':
            return operand1 || operand2;
        case '&':
            return operand1 && operand2;
        case '.':
            return `${operand1}${operand2}`;
        case 'T':
            return operand2.slice(0, operand1);
        case 'D':
            return operand2.slice(operand1);
        default:
            throw new Error(`Unsupported binary operator: ${operator}`);
    }
}

function testICFPEvaluator() {
    // Test Boolean literals
    runTest('Evaluate True', 'T', true);
    runTest('Evaluate False', 'F', false);

    // Test integer parsing
    runTest('Evaluate Integer from base-94 (! represents 0)', 'I!', 0);
    runTest('Evaluate Integer from base-94 ($ represents 3)', 'I$', 3);
    runTest('Evaluate Integer from base-94 (I/6 represents 1337)', 'I/6', 1337);

    // Test string decoding (adjust these based on your actual decodeString function)
    runTest('Decode simple encoded string (! maps to "a")', 'S!', 'a');  // Adjust expected value based on actual decoding
    runTest('Decode string (SB%,,/}Q/2,$_ maps to "Hello World!")', 'SB%,,/}Q/2,$_', 'Hello World!');  // Adjust expected value based on actual decoding

    // Test unary operators
    runTest('Negate zero', 'U- I!', 0);
    runTest('Int neg', 'U- I$', -3);
    runTest('Bool not', 'U! T', false);
    runTest('string-to-int: interpret a string as a base-94 number', 'U# S4%34', 15818151);
    runTest('int-to-string: inverse of the above', 'U$ I4%34', 'test');
    runTest('12', 'I-', 12);

    runTest('Negate binary', 'U- B+ I# I$', -5);
    runTest('concat-to-int: interpret a string as a base-94 number', 'U# B. S4% S34', 15818151);

    // Test binary operators
    runBinaryTest('Integer addition', '+', 3, 2, 5);
    runBinaryTest('Integer subtraction', '-', 3, 2, 1);
    runBinaryTest('Integer multiplication', '*', 2, 3, 6);
    runBinaryTest('Integer division', '/', -9, 3, -3);
    runBinaryTest('Integer modulo', '%', -3, 2, -1);
    runBinaryTest('Integer comparison less', '<', 2, 3, true);
    runBinaryTest('Integer comparison greater', '>', 3, 2, true);
    runBinaryTest('Equality comparison', '=', 2, 3, false);
    runBinaryTest('Boolean OR', '|', false, true, true);
    runBinaryTest('Boolean AND', '&', true, false, false);
    runBinaryTest('String concatenation', '.', "Hello ", "World", "Hello World");
    runBinaryTest('Take first x chars of string y', 'T', 3, "test", "tes");
    runBinaryTest('Drop first x chars of string y', 'D', 1, "test", "est");

    runTest('mul of negations', 'B* U- I$ U- I$', 9);
    runTest('mul of muls', 'B* B* I$ I# B* I$ I#', 36);

    // Test conditionals
    runTest('Conditional true branch', '? T S! S"', 'a');  // Assuming 'S!' decodes to 'a'
    runTest('Conditional false branch', '? F S! S"', 'b');  // Assuming 'S"' decodes to 'b'
    runTest('If from spec', '? B> I# I$ S9%3 S./', 'no');

    runTest('Conditional true branch comp', '? T B* B* I$ I# B* I$ I# S"', 36);
    runTest('Conditional false branch comp', '? F B* B* I$ I# B* I$ I# B* U- I$ U- I$', 9);

    // Test labmda abstractions and applications
    runTest('Lambda simple', 'B$ L" v" I$', 3);
    runTest('Lambda negation', 'U- B$ L" v" I$', -3);
    runTest('Addition of two Lambdas simple', 'B+ B$ L" v" I$ B$ L" v" I$', 6);

    runTest('Lambda simple mul body', 'B$ L" v" B* I$ I$', 9);
    runTest('Lambda simple add arg', 'B$ L" B+ v" v" I$', 6);
    

    runTest('Lambda simple ops arg and body', 'B$ L" B+ v" v" B* I$ I#', 12);

    runTest('Lambda nested simple', 'B$ L$ B$ L" v" I$ I"', 3);
    runTest('Spec lambda', 'B$ B$ L# L$ v# B. SB%,,/ S}Q/2,$_ IK', 'Hello World!');
    
    runTest('Lambda lazy param minimal', 'B$ L# I- v8', 12);    
    runTest('Lambda nested from spec with lazy param', 'B$ L# B$ L" B+ v" v" B* I$ I# v8', 12);    
    runTest('Spec limit', 'B$ B$ L" B$ L# B$ v" B$ v# v# L# B$ v" B$ v# v# L" L# ? B= v# I! I" B$ L$ B+ B$ v" v$ B$ v" v$ B- v# I" I%', 16);

    
}

// Run the test function
testICFPEvaluator();

//let expr = eval.parse('B$ L" v" I$');
//let expr = eval.parse('B$ B$ L" B$ L# B$ v" B$ v# v# L# B$ v" B$ v# v# L" L# ? B= v# I! I" B$ L$ B+ B$ v" v$ B$ v" v$ B- v# I" I%');
//let expr = eval.parse('B$ L# B$ L" B+ v" v" B* I$ I# v8');
let expr = eval.parse('B$ L# I- v8');
//console.log(expr);
//console.log("Evaluated recursive:", eval.evaluater(expr));
console.log("Evaluated:", eval.evaluate(expr));

/*
let expr = parse("B$ B$ L# L$ v# B. SB%,,/ S}Q/2,$_ IK");
console.log(expr);
console.log(evaluate(expr));

expr = parse('B$ L# B$ L" B+ v" v" B* I$ I# v8');
console.log(expr);
console.log(evaluate(expr));
*/
