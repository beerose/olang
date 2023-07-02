import { buildLexer } from "typescript-parsec";

export enum TokenKind {
  Number = "n",
  Equals = "=",
  Plus = "+",
  Minus = "-",
  Asterisk = "*",
  AsteriskAsterisk = "**",
  RightSlash = "/",
  LeftParen = "(",
  RightParen = ")",
  Space = " ",
  Identifier = "i",
  LetKeyword = "let",
}

export type OperatorTokenKind =
  | TokenKind.Equals
  | TokenKind.Plus
  | TokenKind.Minus
  | TokenKind.Asterisk
  | TokenKind.RightSlash
  | TokenKind.Asterisk
  | TokenKind.AsteriskAsterisk;

export const lexer = buildLexer([
  [true, /^\d+(\.\d+)?/g, TokenKind.Number],
  [true, /^\=/g, TokenKind.Equals],
  [true, /^\+/g, TokenKind.Plus],
  [true, /^\-/g, TokenKind.Minus],
  [true, /^\*/g, TokenKind.Asterisk],
  [true, /^\*\*/g, TokenKind.Asterisk],
  [true, /^\//g, TokenKind.RightSlash],
  [true, /^\(/g, TokenKind.LeftParen],
  [true, /^\)/g, TokenKind.RightParen],
  [false, /^\s+/g, TokenKind.Space],
  [true, /^let/g, TokenKind.LetKeyword],
  [true, /^[a-zA-Z_][a-zA-Z0-9_]*/g, TokenKind.Identifier],
]);
