function evaluater(expr, env = new Environment()) {
    console.log('Evaluating:', expr.toString());

    if (expr instanceof Bool || expr instanceof Int || expr instanceof Str) {
        return expr.value;
    } else if (expr instanceof Var) {
        let value = env.lookup(expr.name);
        // If the result is a thunk (function), evaluate it to get the actual value
        console.log('Var lookup:', expr.name, value);
        return typeof value === 'function' ? value() : value;
    } else if (expr instanceof Lambda) {
        //console.log('Lambda:', expr.param, expr.body);
        return function(arg) {
            // Create a new environment for the body of the lambda, with the parameter bound
            const localEnv = env.extend();
            localEnv.define(expr.param, arg);
            return evaluater(expr.body, localEnv);
        };
    } else if (expr instanceof UnaryOp) {
        let operand = evaluate(expr.operand, env);
        switch (expr.operator) {
            case '-': return -operand;
            case '!': return !operand;
            case '#': return parseBase94ToInt(encodeString(operand));  // Convert base-94 encoded string to integer
            case '$': return decodeString(intToBase94(operand));  // Convert integer to base-94 encoded string
            // Add more unary operations as per your language specification
            default:
                throw new Error(`Unknown unary operator: ${operator}`);
        }
    } else if (expr instanceof BinaryOp) {
        if (expr.operator === '$') {
            let func = evaluater(expr.left, env);
            if (typeof func !== 'function') {
                throw new Error('Left operand must be a function for application.');
            }
            let argThunk = () => evaluater(expr.right, env);
            //console.log('Applying:', func, argThunk);
            let ret = func(argThunk);
            //console.log('Applying result:', ret);
            //console.log('Reductions:', ++reductions);
            return ret;
        } else {
            let left = evaluater(expr.left, env);
            let right = evaluater(expr.right, env);
            switch (expr.operator) {
                case '+': return left + right;
                case '-': return left - right;
                case '*': return left * right;
                case '/': return Math.floor(left / right);
                case '%': return left % right;
                case '>': return left > right;
                case '<': return left < right;
                case '=': return left === right;
                case '|': return left || right;
                case '&': return left && right;
                case '.': return `${left}${right}`;
                case 'T': return left.substring(0, right);
                case 'D': return left.substring(0, left.length - right);            
                default: throw new Error("Unsupported binary operator " + expr.operator);
            }
        }
    } else if (expr instanceof Conditional) {
        let condition = evaluater(expr.condition, env);
        if (condition) {
            return evaluater(expr.trueBranch, env);
        } else {
            return evaluater(expr.falseBranch, env);
        }
    }
}

let reductions = 0;

// Helper to convert base-94 string to integer
function parseBase94ToInt(base94) {
    const chars = '!"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~';
    let result = 0;
    let exponent = 0;  // Start exponent at 0, increasing as we move through each character

    for (let i = base94.length - 1; i >= 0; i--) {
        let index = chars.indexOf(base94[i]);
        if (index === -1) {
            throw new Error(`Character '${base94[i]}' not found in base-94 character set.`);
        }
        result += index * Math.pow(94, exponent++);
    }

    return result;
}

// Helper to convert integer to base-94 string
function intToBase94(num) {
    const chars = '!"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~';
    let result = '';
    while (num > 0) {
        result = chars[num % 94] + result;
        num = Math.floor(num / 94);
    }
    return result || '!';
}

function decodeString(encodedBody) {
  const customOrder = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!"#$%&\'()*+,-./:;<=>?@[\\]^_`|~ \n';
  
  // Create a map from the ICFP character order to regular characters
  let decodeMap = {};
  for (let i = 33; i <= 126; i++) {
    decodeMap[String.fromCharCode(i)] = customOrder[i - 33];
  }

  // Decode the string
  let decodedString = '';
  for (let char of encodedBody) {
        decodedString += decodeMap[char];
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
    
    // Encode the string
    let encodedString = '';
    for (let char of inputString) {
      if (encodeMap[char] === undefined) {
        throw new Error('Character ' + char + ' cannot be encoded');
      } else {
        encodedString += encodeMap[char];
      }
    }
  
    return /*"S" + */encodedString;
}


class Expr {}  // Base class for all expressions

class Bool extends Expr {
    constructor(value) {
        super();
        this.value = value;
    }

    toString() {
        return this.value;
    }
}

class Int extends Expr {
    constructor(value) {
        super();
        this.value = value;
    }

    toString() {     
        return this.value;
    }
}

class Str extends Expr {
    constructor(value) {
        super();
        this.value = value;
    }

    toString() {     
        return this.value;
    }
}

class Var extends Expr {
    constructor(name) {
        super();
        this.name = name;
    }

    toString() {
        return "v" + this.name;
    }
}

class Lambda extends Expr {
    constructor(param, body) {
        super();
        this.param = param;
        this.body = body;
    }

    toString() {
        return "L" + this.param + " (" + this.body.toString() + ")";
    }
}

class UnaryOp extends Expr {
    constructor(operator, operand) {
        super();
        this.operator = operator;
        this.operand = operand;
    }

    toString() {
        return this.operator + this.operand.toString();
    }
}

class BinaryOp extends Expr {
    constructor(operator, left, right) {
        super();
        this.operator = operator;
        this.left = left;
        this.right = right;
    }

    toString() {
        return this.left.toString() + " " + this.operator + " " + this.right.toString();
    }
}

class Conditional extends Expr {
    constructor(condition, trueBranch, falseBranch) {
        super();
        this.condition = condition;
        this.trueBranch = trueBranch;
        this.falseBranch = falseBranch;
    }

    toString() {
        return "(" + this.condition.toString() + " ? " + this.trueBranch.toString() + " : " + this.falseBranch.toString() + ")";
    }
}

function parseExpression(tokens, pos = { index: 0 }) {
    if (pos.index >= tokens.length) return null;
    let token = tokens[pos.index];
    let expr = null;

    const indicator = token[0];
    const body = token.slice(1);

    switch (indicator) {
        case 'T':
            expr = new Bool(true);
            pos.index++;
            break;
        case 'F':
            expr = new Bool(false);
            pos.index++;
            break;
        case 'I':
            expr = new Int(parseBase94ToInt(body));
            pos.index++;
            break;
        case 'S':
            expr = new Str(decodeString(body));
            pos.index++;
            break;
        case 'U':
            pos.index++;
            const operand = parseExpression(tokens, pos);
            if (!operand) throw new Error("Unary operation missing operand");
            expr = new UnaryOp(body, operand);
            break;
        case 'B':
            pos.index++;
            const left = parseExpression(tokens, pos);
            const right = parseExpression(tokens, pos);
            if (!left || !right) throw new Error("Binary operation missing operands");
            expr = new BinaryOp(body, left, right);
            break;
        case '?':
            pos.index++;
            const condition = parseExpression(tokens, pos);
            const trueBranch = parseExpression(tokens, pos);
            const falseBranch = parseExpression(tokens, pos);
            if (!condition || !trueBranch || !falseBranch) throw new Error("Conditional expression missing branches");
            expr = new Conditional(condition, trueBranch, falseBranch);
            break;
        case 'L':
            const param = parseBase94ToInt(body);
            pos.index++;
            const lambdaBody = parseExpression(tokens, pos);
            expr = new Lambda(param, lambdaBody);
            break;
        case 'v':
            const varName = parseBase94ToInt(body);
            expr = new Var(varName);
            pos.index++;
            break;
        default:
            expr = new Var(token);
            pos.index++;
            break;
    }

    return expr;
}

function parse(input) {
    const tokens = input.split(' ');
    return parseExpression(tokens, { index: 0 });
}

// Represents an environment as a JavaScript object
class Environment {
    constructor(parent = null) {
        this.bindings = {};
        this.parent = parent;
    }

    define(name, value) {
        //console.log('Define:', name);
        this.bindings[name] = value;
    }

    lookup(name) {
        let scope = this;
        while (scope !== null) {
            if (name in scope.bindings) {
                //console.log('Lookup:', name, scope.bindings[name]);
                return scope.bindings[name];
            }
            scope = scope.parent;
        }
        throw new Error(`Variable ${name} is not defined`);
    }

    claimArg() {
        let scope = this;
        const name = 'unclaimed arg';
        while (scope !== null) {
            if (name in scope.bindings) {
                //console.log('<<< Claiming:', name);
                let arg = scope.bindings[name];
                delete scope.bindings[name];
                return arg;
            }
            scope = scope.parent;
        }

        return null;
        //throw new Error(`Unclaimed argument is not found`);
    }

    extend() {
        return new Environment(this);
        //return this;
    }
}

function evaluate(rootExpr, rootEnv = new Environment()) {
    let stack = [{ expr: rootExpr, env: rootEnv, cont: (result) => result }];
    let value;

    function stackPush(expr, env, cont) {
        //console.log('Pushing to stack:', expr/*, env, cont*/);
        stack.push({ expr, env, cont});
    }

    while (stack.length > 0) {
        const { expr, env, cont } = stack.pop();
        //console.log('sl:', stack.length, 'Evaluating:', expr/*, env, cont*/);
        console.log('Evaluating:', expr.toString());

        if (expr instanceof Bool || expr instanceof Int || expr instanceof Str) {
            value = cont(expr.value);
        } else if (expr instanceof Var) {
            let val = env.lookup(expr.name);
            console.log('Var lookup:', expr.name, val);
            if(typeof val !== 'function') {
                //console.log('Var lookup:', expr.name, val, cont);
                throw new Error('Var lookup returned not a function');
            }
            val(cont);
        } else if (expr instanceof Lambda) {
            //console.log('Evaluating lambda: #', expr.param, expr.body);
            const lambdaEnv = env.extend();
            let argThunk = lambdaEnv.claimArg();  // Claim the argument

            // we are not supposed to apply anything to this lambda ?
            if(argThunk != null) {
                lambdaEnv.define(expr.param, argThunk);  // Store the arg thunk as a named variable
            }
            stackPush(expr.body, lambdaEnv, cont);
        } else if (expr instanceof BinaryOp) {
            if(expr.operator === '$') {
                // Define a thunk that is only evaluated when accessed
                let argThunk = (contThunk) => {
                    //console.log('$ Evaluating lambda arg');
                    //console.log(argThunk, cont)
                    stackPush(
                        expr.right,
                        env.extend(),
                        contThunk
                    );
                };

                //console.log('>>> Storing unclaimed arg:', expr.right.toString());
                const applyEnv = env.extend();
                applyEnv.define('unclaimed arg', argThunk);  // Store the thunk directly

                stackPush(
                    expr.left,
                    applyEnv,
                    (param) => {
                        //console.log('$ cont left:', expr.left, param, cont);
                        return cont(param);
                    }
                );
            }
            else {
                stackPush(expr.left, env, (left) => {
                    //console.log('Binary cont 1:', expr.operator, left);
                    stackPush(expr.right, env, (right) => {
                        //console.log('Binary cont 2:', expr.operator, right);
                        switch (expr.operator) {
                            case '+': return cont(left + right);
                            case '-': return cont(left - right);
                            case '*': return cont(left * right);
                            case '/': return cont(Math.trunc(left / right));
                            case '%': return cont(left % right);
                            case '>': return cont(left > right);
                            case '<': return cont(left < right);
                            case '=': return cont(left === right);
                            case '|': return cont(left || right);
                            case '&': return cont(left && right);
                            case '.': return cont(`${left}${right}`);
                            case 'T': return cont(right.slice(0, left));
                            case 'D': return cont(right.slice(left));                            
                            default: throw new Error("Unsupported binary operator " + expr.operator);
                        }
                    });
                });
            }
        } else if (expr instanceof UnaryOp) {
            //console.log('Unary pushed:', expr.operator, expr.operand);
            stackPush(expr.operand, env, (operand) => {
                //console.log("Unary cont", operand);
                switch (expr.operator) {
                    case '-': return cont(-operand);
                    case '!': return cont(!operand);
                    case '#': return cont(parseBase94ToInt(encodeString(operand)));
                    case '$': return cont(decodeString(intToBase94(operand)));
                    default: throw new Error(`Unknown unary operator: ${expr.operator}`);
                }
            });
        } else if (expr instanceof Conditional) {
            stackPush(expr.condition, env, (condition) => {
                stackPush(condition ? expr.trueBranch : expr.falseBranch, env, cont );
            });
        }
    }

    return value;  // The final result after all expressions are evaluated
}


//let expr = parse('B$ L" B+ v" v" I$');
//let expr = parse('B$ L" B+ I$ I$ I$');
//let expr = parse('B+ I# I$');
//console.log(expr);
//console.log("Evaluated recursive:", eval.evaluater(expr));
//let expr = parse('B$ L" B+ v" I$ I"');
//let expr = parse('B$ L" v" I"');

//let expr = 'L# I"';
//let expr = 'B$ B$ L" B$ L# B$ v" I" I" L" L# I" I" I%';
//let expr = 'B$ B$ L" B$ L# B$ v" B$ v# v# L# B$ v" B$ v# v# L" L# ? B= v# I! I" B$ L$ B+ B$ v" v$ B$ v" v$ B- v# I" I%;';
//let expr = 'U- B$ L" v" I$';
//let expr = 'B$ B$ L# L$ v# B. SB%,,/ S}Q/2,$_ IK';

let expr = 'B$ L# B$ v# I" L# v#';
console.log(expr);
const parsed = parse(expr);
console.log(parsed.toString());
console.log("Evaluated recursively:", evaluater(parsed));
console.log("Evaluated:", evaluate(parsed));


module.exports = { parse, evaluate};

/*

L1 
    (L2 <-- #c1 -> s3
        (
            v1 
            $ 
            1
        )
        $ 
        1
    ) 
    $ 
    L1 <-- #s2
        (
            L2 (1)
        )
    $ 
    1 <-- #s1

*/