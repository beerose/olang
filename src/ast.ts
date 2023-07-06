import { TokenKind } from "./lexer";

export type SyntaxKind =
  | "BinaryExpression"
  | "UnaryExpression"
  | "NumericLiteral"
  | "Identifier"
  | "VariableDeclaration"
  | "Function"
  | "FunctionCall"
  | "Program";

export interface BaseNode {
  kind: SyntaxKind;
}

export interface NumericLiteral extends BaseNode {
  kind: "NumericLiteral";
  value: number;
}

export interface BinaryExpression extends BaseNode {
  kind: "BinaryExpression";
  left: Expression;
  operator:
    | TokenKind.Equals
    | TokenKind.Plus
    | TokenKind.Minus
    | TokenKind.Asterisk
    | TokenKind.RightSlash
    | TokenKind.Asterisk
    | TokenKind.Percent
    | TokenKind.AsteriskAsterisk;
  right: Expression;
}

export interface UnaryExpression extends BaseNode {
  kind: "UnaryExpression";
  operator: TokenKind.Minus;
  operand: Expression;
}

export interface Identifier extends BaseNode {
  kind: "Identifier";
  name: string;
}

export interface VariableDeclaration extends BaseNode {
  kind: "VariableDeclaration";
  name: Identifier;
  initializer: Expression;
}

export interface FunctionExpression extends BaseNode {
  kind: "Function";
  parameters: Identifier[];
  body: Statement[] | Expression;
}

export interface FunctionCall extends BaseNode {
  kind: "FunctionCall";
  name: Identifier;
  arguments: Expression[];
}

export interface Program extends BaseNode {
  kind: "Program";
  statements: Statement[];
}

export type Node = Program | Expression | Statement;

export type Expression =
  | NumericLiteral
  | BinaryExpression
  | UnaryExpression
  | Identifier
  | FunctionExpression
  | FunctionCall;

export type Statement = Expression | VariableDeclaration;
