import * as ast from "./ast";
import { SyntaxKind } from "./ast";
import { TokenKind } from "./lexer";
import { printAst } from "./printer";

export function visit(
  node: ast.Node,
  visitor: {
    [Key in ast.SyntaxKind]?: {
      enter?(node: Extract<ast.Node, { kind: Key }>): void;
      exit?(node: Extract<ast.Node, { kind: Key }>): void;
    };
  }
) {
  const stack = [node];

  while (stack.length) {
    const current = stack.pop()!;
    const { enter, exit } = visitor[current.kind] || {};
    if (enter) {
      (enter as (node: ast.Node) => void)(current);
    }

    switch (current.kind) {
      case "Program":
        stack.push(...current.statements.reverse());
        break;
      case "BinaryExpression":
        stack.push(current.left, current.right);
        break;
      case "UnaryExpression":
        stack.push(current.operand);
        break;
      case "FunctionCall":
        stack.push(...current.arguments);
        break;
      case "VariableDeclaration":
        stack.push(current.name);
        stack.push(current.initializer);
        break;
      case "FunctionExpression":
        const params = [...current.parameters].reverse();
        const body = [...current.body].reverse();
        stack.push(...params, ...body);
        break;
      case "Identifier":
      case "NumericLiteral":
        break;
      default:
        const _exhaustiveCheck: never = current;
        throw new Error(`Unhandled node kind: ${(current as ast.Node).kind}`);
    }

    if (exit) {
      (exit as (node: ast.Node) => void)(current);
    }
  }
}

interface Scope {
  parent: Scope | null;
  bindings: Record<string, unknown>;
}

function printScope(scope: Scope) {
  if (scope.parent) printScope(scope.parent!);
  console.log("--- ^ --- ^ ---");
  for (const key in scope.bindings) {
    const value = scope.bindings[key];
    console.log(
      key,
      "=",
      typeof value === "object" && "kind" in (value as ast.Node)
        ? printAst(value as ast.Node)
        : value
    );
  }
}

function getBinding(scope: Scope, name: string): unknown {
  if (name in scope.bindings) return scope.bindings[name];
  if (scope.parent) return getBinding(scope.parent, name);
  throw new Error(`Undefined variable: ${name}`);
}

type Result = any;

export function interpret(programAst: ast.Program): Result {
  let scope: Scope = {
    parent: null,
    bindings: {},
  };

  function createFunctionScope(node: ast.FunctionCall, scope: Readonly<Scope>) {
    const functionName = node.name.name;
    const functionDeclaration = getBinding(
      scope,
      functionName
    ) as ast.FunctionExpression;

    const fnScope: Scope = {
      parent: scope,
      bindings: {},
    };

    for (let i = 0; i < functionDeclaration.parameters.length; i++) {
      const parameter = functionDeclaration.parameters[i];
      const argument = node.arguments[i];
      if (!argument || !parameter) {
        throw new Error("Illegal function call. Missing argument.");
      }

      fnScope.bindings[parameter.name] = evaluate(argument, scope);
    }

    return { functionDeclaration, fnScope };
  }

  function evaluate(node: ast.Node, scope: Scope): Result {
    console.log("evaluate", node);
    switch (node.kind) {
      case "Identifier":
        return getBinding(scope, node.name);
      case "NumericLiteral":
        return node.value;
      case "UnaryExpression":
        const operand = evaluate(node.operand, scope);
        return -operand;
      case "BinaryExpression":
        const left = evaluate(node.left, scope);
        const right = evaluate(node.right, scope);
        switch (node.operator) {
          case TokenKind.Plus:
            return left + right;
          case TokenKind.Minus:
            return left - right;
          case TokenKind.Asterisk:
            return left * right;
          case TokenKind.RightSlash:
            return left / right;
          case TokenKind.AsteriskAsterisk:
            return left ** right;
          default:
            throw new Error(`Unhandled binary operator: ${node.operator}`);
        }
      case "FunctionCall": {
        let result: Result = null;
        const { fnScope, functionDeclaration } = createFunctionScope(
          node,
          scope
        );

        printScope(fnScope);

        for (const statement of functionDeclaration.body) {
          result = evaluate(statement, fnScope);
        }

        return result;
      }

      case "VariableDeclaration": {
        const value = evaluate(node.initializer, scope);
        scope.bindings[node.name.name] = value;
        return value;
      }

      case "FunctionExpression": {
        return node;
      }

      case "Program": {
        let result: Result = null;
        for (const statement of node.statements) {
          result = evaluate(statement, scope);
        }
        return result;
      }
    }
  }

  console.log(scope.bindings);
  return evaluate(programAst, scope);
}
