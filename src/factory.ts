import * as ast from "./ast";
import type { OperatorTokenKind, TokenKind } from "./lexer";

export function NumericLiteral(value: number): ast.NumericLiteral {
  return {
    kind: "NumericLiteral",
    value,
  } as const;
}

export function BinaryExpression(
  left: ast.Expression,
  operator: OperatorTokenKind,
  right: ast.Expression
): ast.BinaryExpression {
  return {
    kind: "BinaryExpression",
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
    kind: "UnaryExpression",
    operator,
    operand,
  } as const;
}

export function Identifier(name: string): ast.Identifier {
  return {
    kind: "Identifier",
    name,
  } as const;
}

export function VariableDeclaration(
  name: ast.Identifier,
  initializer: ast.Expression
): ast.VariableDeclaration {
  return {
    kind: "VariableDeclaration",
    name,
    initializer,
  } as const;
}

export function FunctionExpression(
  parameters: ast.FunctionParameters,
  body: ast.Expression | ast.Statement[]
): ast.FunctionExpression {
  return {
    kind: "Function",
    parameters,
    body,
  } as const;
}

export function FunctionParameters(
  parameters: ast.Identifier[]
): ast.FunctionParameters {
  return {
    kind: "FunctionParameters",
    parameters,
  } as const;
}

export function CallExpression(
  name: ast.Identifier,
  args: ast.Expression[]
): ast.FunctionCall {
  return {
    kind: "FunctionCall",
    name,
    arguments: args,
  } as const;
}

export function Program(statements: ast.Statement[]): ast.Program {
  return {
    kind: "Program",
    statements,
  } as const;
}
