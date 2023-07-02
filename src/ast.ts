import { TokenKind } from "./lexer";

export enum SyntaxKind {
  BinaryExpression = "b",
  UnaryExpression = "u",
  NumericLiteral = "n",
  Identifier = "i",
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
  | Identifier;

export type Node = Expression;
