import * as ast from "./ast";
import type { OperatorTokenKind, TokenKind } from "./lexer";

export function NumericLiteral(value: number): ast.NumericLiteral {
  return {
    kind: ast.SyntaxKind.NumericLiteral,
    value,
  } as const;
}

export function BinaryExpression(
  left: ast.Expression,
  operator: OperatorTokenKind,
  right: ast.Expression
): ast.BinaryExpression {
  return {
    kind: ast.SyntaxKind.BinaryExpression,
    left,
    operator,
    right,
  } as const;
}

export function UnaryExpression(
  operator: TokenKind.Minus,
  operand: ast.Expression
): ast.UnaryExpression {
  return {
    kind: ast.SyntaxKind.UnaryExpression,
    operator,
    operand,
  } as const;
}

export function Identifier(name: string): ast.Identifier {
  return {
    kind: ast.SyntaxKind.Identifier,
    name,
  } as const;
}

export function VariableDeclaration(
  name: ast.Identifier,
  initializer: ast.Expression
): ast.VariableDeclaration {
  return {
    kind: ast.SyntaxKind.VariableDeclaration,
    name,
    initializer,
  } as const;
}