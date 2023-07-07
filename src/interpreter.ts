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

// #region debugger
export function astDebugger(events: EvaluationEvents) {
  return function debug(
    node: ast.Node,
    scope: Scope,
    code: string,
    value: unknown
  ) {
    events.push({
      kind: node.kind,
      nid: (node as any).id,
      scope: scope,
      code,
      value,
    });
  };
}

export type EvaluationEvents = Array<{
  kind: ast.SyntaxKind;
  nid: number;
  scope: Scope;
  code: string;
  value: unknown;
}>;

function printScope(scope: Scope) {
  if (scope.parent) printScope(scope.parent!);
  console.log("--- ^ --- ^ ---");
  for (const key in scope.bindings) {
    const value = scope.bindings[key];
    console.log(
      `[${key}]:`,
      typeof value === "object" && "kind" in (value as ast.Node)
        ? printAst(value as ast.Node)
        : value
    );
  }
}
// #endregion

interface Scope {
  parent: Scope | null;
  bindings: Record<string, unknown>;
}

function getBinding(scope: Scope, name: string): unknown {
  if (name in scope.bindings) return scope.bindings[name];
  if (scope.parent) return getBinding(scope.parent, name);
  throw new Error(`Undefined variable: ${name}`);
}

type Result = any; // todo

export function interpret(
  programAst: ast.Program,
  debug?: ReturnType<typeof astDebugger>
): Result {
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
        debug?.(node, scope, printAst(node), -operand);

        return -operand;
      case "BinaryExpression":
        const left = evaluate(node.left, scope);
        const right = evaluate(node.right, scope);

        let binaryResult: Result = null;
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
          default:
            throw new Error(`Unhandled binary operator: ${node.operator}`);
        }
        debug?.(node, scope, printAst(node), binaryResult);

        return binaryResult;
      case "FunctionCall": {
        let result: Result = null;
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
        scope.bindings[node.name.name] = value;

        debug?.(node, scope, printAst(node), value);
        return value;
      }

      case "FunctionExpression": {
        debug?.(node, scope, printAst(node), node);
        return node;
      }

      case "Program": {
        let result: Result = null;
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
