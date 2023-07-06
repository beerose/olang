import { TokenKind } from "./lexer";

export enum SyntaxKind {
  BinaryExpression = "BinaryExpression",
  UnaryExpression = "UnaryExpression",
  NumericLiteral = "NumericLiteral",
  Identifier = "Identifier",
  VariableDeclaration = "VariableDeclaration",
  Function = "Function",
  FunctionParameters = "FunctionParameters",
  FunctionCall = "FunctionCall",
  FunctionBody = "FunctionBody",
  Program = "Program",
  PrintStatement = "PrintStatement",
  ExpressionStatement = "ExpressionStatement",
}

export interface BaseNode {
  kind: SyntaxKind;
}

export interface NumericLiteral extends BaseNode {
  kind: SyntaxKind.NumericLiteral;
  value: number;
}

export interface BinaryExpression extends BaseNode {
  kind: SyntaxKind.BinaryExpression;
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
  kind: SyntaxKind.UnaryExpression;
  operator: TokenKind.Minus;
  operand: Expression;
}

export interface Identifier extends BaseNode {
  kind: SyntaxKind.Identifier;
  name: string;
}

export interface VariableDeclaration extends BaseNode {
  kind: SyntaxKind.VariableDeclaration;
  name: Identifier;
  initializer: Expression;
}

export interface FunctionExpression extends BaseNode {
  kind: SyntaxKind.Function;
  parameters: FunctionParameters;
  body: FunctionBody | Expression;
}

export interface FunctionBody extends BaseNode {
  kind: SyntaxKind.FunctionBody;
  statements: Statement[];
}

export interface FunctionParameters extends BaseNode {
  kind: SyntaxKind.FunctionParameters;
  parameters: Identifier[];
}

export interface FunctionCall extends BaseNode {
  kind: SyntaxKind.FunctionCall;
  name: Identifier;
  arguments: Expression[];
}

export interface Program extends BaseNode {
  kind: SyntaxKind.Program;
  statements: Statement[];
}

export type Node = Program | Expression | FunctionBody | Statement;

export type Expression =
  | NumericLiteral
  | BinaryExpression
  | UnaryExpression
  | Identifier
  | FunctionExpression
  | FunctionCall;

export type Statement = Expression | VariableDeclaration;
