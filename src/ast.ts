import { TokenKind } from "./lexer"

export type SyntaxKind =
  | "BinaryExpression"
  | "UnaryExpression"
  | "NumericLiteral"
  | "Identifier"
  | "VariableDeclaration"
  | "FunctionExpression"
  | "FunctionCall"
  | "PrintExpression"
  | "ArrayExpression"
  | "Program"

export interface BaseNode {
  kind: SyntaxKind
  meta: {
    from: number
    to: number
  }
}

export interface NumericLiteral extends BaseNode {
  kind: "NumericLiteral"
  value: number
}

export interface BinaryExpression extends BaseNode {
  kind: "BinaryExpression"
  left: Expression
  operator:
    | TokenKind.Equals
    | TokenKind.Plus
    | TokenKind.Minus
    | TokenKind.Asterisk
    | TokenKind.RightSlash
    | TokenKind.Asterisk
    | TokenKind.Percent
    | TokenKind.AsteriskAsterisk
  right: Expression
}

export interface UnaryExpression extends BaseNode {
  kind: "UnaryExpression"
  operator: TokenKind.Minus
  operand: Expression
}

export interface Identifier extends BaseNode {
  kind: "Identifier"
  name: string
}

export interface VariableDeclaration extends BaseNode {
  kind: "VariableDeclaration"
  name: Identifier
  initializer: Expression
}

export interface FunctionExpression extends BaseNode {
  kind: "FunctionExpression"
  parameters: Identifier[]
  body: Expression[]
}

export interface FunctionCall extends BaseNode {
  kind: "FunctionCall"
  name: Identifier
  arguments: Expression[]
}

export interface PrintExpression extends BaseNode {
  kind: "PrintExpression"
  expression: Expression
}

export interface ArrayExpression extends BaseNode {
  kind: "ArrayExpression"
  elements: Expression[]
}

export interface Program extends BaseNode {
  kind: "Program"
  statements: Expression[]
}

export type Node = Program | Expression

export type Expression =
  | NumericLiteral
  | BinaryExpression
  | UnaryExpression
  | Identifier
  | FunctionExpression
  | FunctionCall
  | VariableDeclaration
  | PrintExpression
  | ArrayExpression
