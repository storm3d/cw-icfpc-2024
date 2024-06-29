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
}

class Int extends Expr {
    constructor(value) {
        super();
        this.value = value;
    }
}

class Str extends Expr {
    constructor(value) {
        super();
        this.value = value;
    }
}

class Var extends Expr {
    constructor(name) {
        super();
        this.name = name;
    }
}

class Lambda extends Expr {
    constructor(param, body) {
        super();
        this.param = param;
        this.body = body;
    }
}

class App extends Expr {
    constructor(func, arg) {
        super();
        this.func = func;
        this.arg = arg;
    }
}

class UnaryOp extends Expr {
    constructor(operator, operand) {
        super();
        this.operator = operator;
        this.operand = operand;
    }
}

class BinaryOp extends Expr {
    constructor(operator, left, right) {
        super();
        this.operator = operator;
        this.left = left;
        this.right = right;
    }
}

class Conditional extends Expr {
    constructor(condition, trueBranch, falseBranch) {
        super();
        this.condition = condition;
        this.trueBranch = trueBranch;
        this.falseBranch = falseBranch;
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
        //console.log('Define:', name, value);
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

    extend() {
        return new Environment(this);
    }
}

function evaluate(rootExpr, rootEnv = new Environment()) {
    let stack = [{ expr: rootExpr, env: rootEnv, cont: (result) => result }];
    let value;

    while (stack.length > 0) {
        const { expr, env, cont } = stack.pop();
        console.log('Evaluating:', expr, env, cont);

        if (expr instanceof Bool || expr instanceof Int || expr instanceof Str) {
            value = cont(expr.value);
        } else if (expr instanceof Var) {
            let val = env.lookup(expr.name); // look up the variable in the current environment
            if (typeof val === 'function') {
                // If the variable is a function (possibly a thunk), execute it
                val = val();
            }
            value = cont(val); // pass the variable value to the continuation
        } else if (expr instanceof Lambda) {
            value = cont((argThunk) => {
                return () => {
                    const lambdaEnv = env.extend();
                    lambdaEnv.define(expr.param, argThunk());
                    return evaluate(expr.body, lambdaEnv);
                };
            });
        } else if (expr instanceof UnaryOp) {
            console.log('Unary pushed:', expr.operator, expr.operand);
            stack.push({ expr: expr.operand, env, cont: (operand) => {
                switch (expr.operator) {
                    case '-': 
                    console.log("Negating:", operand);  // Debugging output
                    return cont(-operand);
                    case '!': return cont(!operand);
                    case '#': return cont(parseBase94ToInt(encodeString(operand)));
                    case '$': return cont(decodeString(intToBase94(operand)));
                    default: throw new Error(`Unknown unary operator: ${expr.operator}`);
                }
            }});
        } else if (expr instanceof BinaryOp) {
            if(expr.operator === '$') {
                stack.push({
                    expr: expr.left,
                    env,
                    cont: (func) => {
                        if (typeof func !== 'function') {
                            throw new Error('Expected a function for application, got ' + typeof func);
                        }
                        stack.push({
                            expr: expr.right,
                            env: env.extend(),
                            cont: (arg) => {
                                let result = func(() => arg);  // Assume arg needs to be wrapped in a thunk
                                return cont(result instanceof Function ? result() : result);
                            }
                        });
                    }
                });
            }
            else {
                stack.push({ expr: expr.left, env, cont: (left) => {
                    console.log("Left value for Binary:", left);  // Debugging output
                    stack.push({ expr: expr.right, env, cont: (right) => {
                        console.log("Right value for Binary:", right);  // Debugging output
                        switch (expr.operator) {                            
                            case '+': return cont(left + right);
                            case '-': return cont(left - right);
                            case '*': return cont(left * right);
                            case '/': return cont(Math.trunk(left / right));
                            case '%': return cont(left % right);
                            case '>': return cont(left > right);
                            case '<': return cont(left < right);
                            case '=': return cont(left === right);
                            case '|': return cont(left || right);
                            case '&': return cont(left && right);
                            case '.': return cont(`${left}${right}`);
                            case 'T': return cont(left.substring(0, right));
                            case 'D': return cont(left.substring(0, left.length - right));
                            // Add cases for other binary operators
                            default: throw new Error("Unsupported binary operator " + expr.operator);
                        }
                    }});
                }});
            }
        } else if (expr instanceof Conditional) {
            stack.push({ expr: expr.condition, env, cont: (condition) => {
                stack.push({ expr: condition ? expr.trueBranch : expr.falseBranch, env, cont });
            }});
        }
    }

    return value;  // The final result after all expressions are evaluated
}


/*
function evaluate(expr, env = new Environment()) {
    if (expr instanceof Bool || expr instanceof Int || expr instanceof Str) {
        return expr.value;
    } else if (expr instanceof Var) {
        let value = env.lookup(expr.name);
        // If the result is a thunk (function), evaluate it to get the actual value
        return typeof value === 'function' ? value() : value;
    } else if (expr instanceof Lambda) {
        //console.log('Lambda:', expr.param, expr.body);
        return function(arg) {
            // Create a new environment for the body of the lambda, with the parameter bound
            const localEnv = env.extend();
            localEnv.define(expr.param, arg);
            return evaluate(expr.body, localEnv);
        };
    } else if (expr instanceof App) {
        let func = evaluate(expr.func, env);
        // Call-by-name: wrap argument in a thunk
        let argThunk = () => evaluate(expr.arg, env.extend());
        return func(argThunk);
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
            let func = evaluate(expr.left, env);
            if (typeof func !== 'function') {
                throw new Error('Left operand must be a function for application.');
            }
            let argThunk = () => evaluate(expr.right, env);
            //console.log('Applying:', func, argThunk);
            let ret = func(argThunk);
            //console.log('Applying result:', ret);
            console.log('Reductions:', ++reductions);
            return ret;
        } else {
            let left = evaluate(expr.left, env);
            let right = evaluate(expr.right, env);
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
        let condition = evaluate(expr.condition, env);
        if (condition) {
            return evaluate(expr.trueBranch, env);
        } else {
            return evaluate(expr.falseBranch, env);
        }
    }
}
*/

function evaluateUnary(operator, operand) {
    console.log(`Unary operation ${operator} on: ${operand}`);
    switch (operator) {
        case '!':
            return !operand;
        case '-':
            return -operand;
        case '#':
                return base94ToInt(encodeString(operand)); // Convert base-94 encoded string to integer
        case '$':
            return decodeString(intToBase94(operand));  // Convert integer to base-94 encoded string
        default:
            throw new Error(`Unsupported unary operator: ${operator}`);
    }
}

let reductions = 0;

module.exports = { parse, evaluate };