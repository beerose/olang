import { SyntaxKind } from "../../src/ast";
import { TokenKind } from "../../src/lexer";

export const tokenColors: { [key in TokenKind]: string } = {
  [TokenKind.Number]: "blue",
  [TokenKind.Equals]: "green",
  [TokenKind.Plus]: "red",
  [TokenKind.Minus]: "purple",
  [TokenKind.Asterisk]: "orange",
  [TokenKind.Percent]: "brown",
  [TokenKind.AsteriskAsterisk]: "pink",
  [TokenKind.RightSlash]: "lightblue",
  [TokenKind.LeftParen]: "midnightblue",
  [TokenKind.RightParen]: "midnightblue",
  [TokenKind.LeftBrace]: "lightcoral",
  [TokenKind.RightBrace]: "lightcoral",
  [TokenKind.Space]: "black",
  [TokenKind.Identifier]: "indianred",
  [TokenKind.LetKeyword]: "magenta",
  [TokenKind.Comma]: "darkblue",
  [TokenKind.Arrow]: "slategray",
  [TokenKind.Newline]: "gray",
};

export const expressionColors: { [key in SyntaxKind]: string } = {
  BinaryExpression: "blue",
  UnaryExpression: "green",
  NumericLiteral: "red",
  Identifier: "purple",
  VariableDeclaration: "midnightblue",
  FunctionExpression: "brown",
  FunctionCall: "gray",
  Program: "magenta",
};
