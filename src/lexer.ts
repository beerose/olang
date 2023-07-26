import { buildLexer } from "typescript-parsec";

export enum TokenKind {
  Number = "n",
  Equals = "=",
  Plus = "+",
  Minus = "-",
  Asterisk = "*",
  Percent = "%",
  AsteriskAsterisk = "**",
  RightSlash = "/",
  LeftParen = "(",
  RightParen = ")",
  LeftBrace = "{",
  RightBrace = "}",
  Space = " ",
  Identifier = "i",
  LetKeyword = "let",
  Comma = ",",
  Newline = "\n",
  Arrow = "=>",
}

export type OperatorTokenKind =
  | TokenKind.Equals
  | TokenKind.Plus
  | TokenKind.Minus
  | TokenKind.Asterisk
  | TokenKind.RightSlash
  | TokenKind.Asterisk
  | TokenKind.AsteriskAsterisk
  | TokenKind.Percent;

export const lexer = buildLexer([
  [true, /^\n/g, TokenKind.Newline],
  [true, /^\d+(\.\d+)?/g, TokenKind.Number],
  [true, /^\=/g, TokenKind.Equals],
  [true, /^\+/g, TokenKind.Plus],
  [true, /^\-/g, TokenKind.Minus],
  [true, /^\%/g, TokenKind.Percent],
  [true, /^\*\*/g, TokenKind.AsteriskAsterisk],
  [true, /^\*/g, TokenKind.Asterisk],
  [true, /^\//g, TokenKind.RightSlash],
  [true, /^\(/g, TokenKind.LeftParen],
  [true, /^\)/g, TokenKind.RightParen],
  [false, /^\s+/g, TokenKind.Space], // ignore whitespace
  [true, /^\,/g, TokenKind.Comma],
  [true, /^\{/g, TokenKind.LeftBrace],
  [true, /^\}/g, TokenKind.RightBrace],
  [true, /^=>/g, TokenKind.Arrow],
  [true, /^let/g, TokenKind.LetKeyword],
  [true, /^[a-zA-Z_][a-zA-Z0-9_]*/g, TokenKind.Identifier],
]);
