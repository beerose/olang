import { buildLexer } from "typescript-parsec";


export enum TokenKind {
  Number,
  Plus,
  Minus,
  Asterisk,
  AsteriskAsterisk,
  RightSlash,
  LeftParen,
  RightParen,
  Space,
  Identifier
}

export type OperatorTokenKind =
  | TokenKind.Plus
  | TokenKind.Minus
  | TokenKind.Asterisk
  | TokenKind.RightSlash
  | TokenKind.Asterisk
  | TokenKind.AsteriskAsterisk;

export const lexer = buildLexer([
  [true, /^\d+(\.\d+)?/g, TokenKind.Number],
  [true, /^\+/g, TokenKind.Plus],
  [true, /^\-/g, TokenKind.Minus],
  [true, /^\*/g, TokenKind.Asterisk],
  [true, /^\*\*/g, TokenKind.Asterisk],
  [true, /^\//g, TokenKind.RightSlash],
  [true, /^\(/g, TokenKind.LeftParen],
  [true, /^\)/g, TokenKind.RightParen],
  [false, /^\s+/g, TokenKind.Space],
]);
