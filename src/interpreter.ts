import * as ast from "./ast";
import { Node } from "./ast";
import { TokenKind } from "./lexer";
import { printAst } from "./printer";

// #region debugger
export function astDebugger(events: EvaluationEvents) {
  return function debug(
    node: ast.Node,
    scope: Scope,
    code: string,
    value: Value
  ) {
    events.push({
      kind: node.kind,
      pos: node.meta,
      scope: scope,
      code,
      value,
    });
  };
}

export type EvaluationEvents = Array<{
  kind: ast.SyntaxKind;
  pos: Node["meta"];
  scope: Scope;
  code: string;
  value: Value;
}>;
// #endregion

interface Scope {
  parent: Scope | null;
  bindings: Record<string, Value>;
}

function getBinding(scope: Scope, name: string): Value {
  if (name in scope.bindings) return scope.bindings[name];
  if (scope.parent) return getBinding(scope.parent, name);
  throw new Error(`Undefined variable: ${name}`);
}

// TODO: This might be nice to refactor into a custom type.
export type Value =
  | undefined
  | null
  | number
  | string
  | boolean
  | ast.FunctionExpression;

export function interpret(
  programAst: ast.Program,
  debug?: ReturnType<typeof astDebugger>
): Value {
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

  function evaluate(node: ast.Node, scope: Scope): Value {
    switch (node.kind) {
      case "Identifier":
        const value = getBinding(scope, node.name);
        debug?.(node, scope, node.name, value);

        return value;
      case "NumericLiteral":
        debug?.(node, scope, node.value.toString(), node.value);

        return node.value;
      case "UnaryExpression":
        const operand = evaluate(node.operand, scope);
        if (typeof operand !== "number") {
          throw new Error("Operand must be a number");
        }

        debug?.(node, scope, printAst(node), -operand);

        return -operand;
      case "BinaryExpression":
        const left = evaluate(node.left, scope);
        const right = evaluate(node.right, scope);

        if (typeof left !== "number" || typeof right !== "number") {
          // TODO: String concatenation
          throw new Error("Operands must be numbers");
        }

        let binaryResult: Value = null;
        switch (node.operator) {
          case TokenKind.Plus:
            binaryResult = left + right;
            break;
          case TokenKind.Minus:
            binaryResult = left - right;
            break;
          case TokenKind.Asterisk:
            binaryResult = left * right;
            break;
          case TokenKind.RightSlash:
            binaryResult = left / right;
            break;
          case TokenKind.AsteriskAsterisk:
            binaryResult = left ** right;
            break;
          case TokenKind.Percent:
            binaryResult = left % right;
            break;
          default:
            throw new Error(`Unhandled binary operator: ${node.operator}`);
        }
        debug?.(node, scope, printAst(node), binaryResult);

        return binaryResult;
      case "FunctionCall": {
        let result: Value = null;
        const { fnScope, functionDeclaration } = createFunctionScope(
          node,
          scope
        );

        for (const statement of functionDeclaration.body) {
          result = evaluate(statement, fnScope);
        }

        debug?.(node, scope, printAst(node), result);
        return result;
      }

      case "VariableDeclaration": {
        const value = evaluate(node.initializer, scope);
        if (scope.bindings[node.name.name]) {
          throw new Error(`Variable already declared: ${node.name.name}`);
        }
        scope.bindings[node.name.name] = value;

        debug?.(node, scope, printAst(node), value);
        return value;
      }

      case "FunctionExpression": {
        debug?.(node, scope, printAst(node), node);
        return node;
      }

      case "PrintExpression": {
        debug?.(node, scope, printAst(node), evaluate(node.expression, scope));
        const printExpressionResult = evaluate(node.expression, scope);

        console.log(`${printAst(node)} -> ${printExpressionResult}`);

        return printExpressionResult;
      }

      case "Program": {
        let result: Value = null;
        for (const statement of node.statements) {
          result = evaluate(statement, scope);
        }

        debug?.(node, scope, printAst(node), result);
        return result;
      }
    }
  }

  return evaluate(programAst, {
    parent: null,
    bindings: {},
  });
}
