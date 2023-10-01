import { expect } from "vitest"
import * as ast from "./ast"
import type { OperatorTokenKind, TokenKind } from "./lexer"

export function NumericLiteral(
  value: number,
  meta: ast.Node["meta"] = expect.any(Object)
): ast.NumericLiteral {
  return {
    kind: "NumericLiteral",
    value,
    meta,
  } as const
}

export function BinaryExpression(
  left: ast.Expression,
  operator: OperatorTokenKind,
  right: ast.Expression,
  meta: ast.Node["meta"] = expect.any(Object)
): ast.BinaryExpression {
  return {
    kind: "BinaryExpression",
    left,
    operator,
    right,
    meta,
  } as const
}

export function UnaryExpression(
  operator: TokenKind.Minus,
  operand: ast.Expression,
  meta: ast.Node["meta"] = expect.any(Object)
): ast.UnaryExpression {
  return {
    kind: "UnaryExpression",
    operator,
    operand,
    meta,
  } as const
}

export function Identifier(
  name: string,
  meta: ast.Node["meta"] = expect.any(Object)
): ast.Identifier {
  return {
    kind: "Identifier",
    name,
    meta,
  } as const
}

export function VariableDeclaration(
  name: ast.Identifier,
  initializer: ast.Expression,
  meta: ast.Node["meta"] = expect.any(Object)
): ast.VariableDeclaration {
  return {
    kind: "VariableDeclaration",
    name,
    initializer,
    meta,
  } as const
}

export function FunctionExpression(
  parameters: ast.Identifier[],
  body: ast.Expression[],
  meta: ast.Node["meta"] = expect.any(Object)
): ast.FunctionExpression {
  return {
    kind: "FunctionExpression",
    parameters,
    body,
    meta,
  } as const
}

export function CallExpression(
  name: ast.Identifier,
  args: ast.Expression[],
  meta: ast.Node["meta"] = expect.any(Object)
): ast.FunctionCall {
  return {
    kind: "FunctionCall",
    name,
    arguments: args,
    meta,
  } as const
}

export function Program(
  statements: ast.Expression[],
  meta: ast.Node["meta"] = expect.any(Object)
): ast.Program {
  return {
    kind: "Program",
    statements,
    meta,
  } as const
}
