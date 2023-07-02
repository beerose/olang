import { TokenKind } from "./lexer";

export enum SyntaxKind {
  BinaryExpression = "b",
  UnaryExpression = "u",
  NumericLiteral = "n",
  Identifier = "i",
  VariableDeclaration = "v",
  Function = "f",
  FunctionParameters = "p",
  FunctionCall = "c",
  Block = "block",
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

export type Expression =
  | NumericLiteral
  | BinaryExpression
  | UnaryExpression
  | Identifier
  | VariableDeclaration
  | FunctionExpression
  | Block
  | FunctionCall;

export interface VariableDeclaration extends BaseNode {
  kind: SyntaxKind.VariableDeclaration;
  name: Identifier;
  initializer: Expression;
}

export interface FunctionExpression extends BaseNode {
  kind: SyntaxKind.Function;
  name: Identifier;
  parameters: FunctionParameters;
  body: Block | Expression;
}

export interface Block extends BaseNode {
  kind: SyntaxKind.Block;
  statements: Expression[];
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

export type Node = Expression;
