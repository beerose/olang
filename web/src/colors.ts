import { SyntaxKind } from "../../src/ast";
import { TokenKind } from "../../src/lexer";

export const tokenColors: { [key in TokenKind]: string } = {
  [TokenKind.Number]: "#015c6b",
  [TokenKind.Equals]: "#422c4f",
  [TokenKind.Plus]: "#422c4f",
  [TokenKind.Minus]: "#422c4f",
  [TokenKind.Asterisk]: "#422c4f",
  [TokenKind.Percent]: "#422c4f",
  [TokenKind.AsteriskAsterisk]: "#422c4f",
  [TokenKind.RightSlash]: "#422c4f",
  [TokenKind.LeftParen]: "#d0513d",
  [TokenKind.RightParen]: "#d0513d",
  [TokenKind.LeftBrace]: "#4d4400",
  [TokenKind.RightBrace]: "#4d4400",
  [TokenKind.Space]: "black",
  [TokenKind.Identifier]: "rgb(255 0 157)",
  [TokenKind.LetKeyword]: "#ff3c5e",
  [TokenKind.Comma]: "#6abba3",
  [TokenKind.Arrow]: "#6abba3",
  [TokenKind.Newline]: "gray",
};

export const expressionColors: { [key in SyntaxKind]: string } = {
  BinaryExpression: "#422c4f",
  UnaryExpression: "#4f004e",
  NumericLiteral: "#015c6b",
  Identifier: "rgb(255 0 157)",
  VariableDeclaration: "#0061b4",
  FunctionExpression: "#6446b9",
  FunctionCall: "rgb(58, 151, 10)",
  Program: "#c751c4",
};
