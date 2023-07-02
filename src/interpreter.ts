import * as ast from "./ast";
import { TokenKind } from "./lexer";

export function evaluate(expr: ast.Expression): number {
  switch (expr.kind) {
    case ast.SyntaxKind.NumericLiteral:
      return expr.value;
    case ast.SyntaxKind.BinaryExpression:
      return evaluateBinaryExpression(expr);
    case ast.SyntaxKind.UnaryExpression:
      return evaluateUnaryExpression(expr);
    case ast.SyntaxKind.VariableDeclaration:
      return evaluateVariableDeclaration(expr);
    case ast.SyntaxKind.Identifier:
      return evaluateIdentifier(expr);
    case ast.SyntaxKind.Function:
      return evaluateFunction(expr);
    case ast.SyntaxKind.Block:
      return evaluateBlock(expr);
    case ast.SyntaxKind.FunctionCall:
      return evaluateFunctionCall(expr);
  }
}

function evaluateBinaryExpression(expr: ast.BinaryExpression): number {
  const left = evaluate(expr.left);
  const right = evaluate(expr.right);

  switch (expr.operator) {
    case TokenKind.Equals:
      return left === right ? 1 : 0;
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
  }
}

function evaluateUnaryExpression(expr: ast.UnaryExpression) {
  const operand = evaluate(expr.operand);

  return -operand;
}

function evaluateVariableDeclaration(expr: ast.VariableDeclaration) {
  return evaluate(expr.initializer);
}

function evaluateIdentifier(expr: ast.Identifier) {
  throw new Error("Not implemented");
}

function evaluateFunction(expr: ast.FunctionExpression) {
  throw new Error("Not implemented");
}

function evaluateBlock(expr: ast.Block) {
  throw new Error("Not implemented");
}

function evaluateFunctionCall(expr: ast.FunctionCall) {
  throw new Error("Not implemented");
}
