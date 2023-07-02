import { TokenKind } from "./lexer";

export enum SyntaxKind {
  BinaryExpression,
  UnaryExpression,
  NumericLiteral,
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

export type Expression = NumericLiteral | BinaryExpression | UnaryExpression;

export type Node = NumericLiteral | BinaryExpression | UnaryExpression;
