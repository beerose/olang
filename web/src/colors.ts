import { SyntaxKind } from "../../src/ast";
import { TokenKind } from "../../src/lexer";

export const tokenColors: { [key in TokenKind]: string } = {
  [TokenKind.Number]: "#00b5b3",
  [TokenKind.Equals]: "#422c4f",
  [TokenKind.Plus]: "#422c4f",
  [TokenKind.Minus]: "#422c4f",
  [TokenKind.Asterisk]: "#422c4f",
  [TokenKind.AsteriskAsterisk]: "#422c4f",
  [TokenKind.RightSlash]: "#422c4f",
  [TokenKind.LeftParen]: "#6a737d",
  [TokenKind.RightParen]: "#6a737d",
  [TokenKind.LeftBrace]: "#ad6757",
  [TokenKind.RightBrace]: "#4d4400",
  [TokenKind.Space]: "black",
  [TokenKind.Identifier]: "#005cc5",
  [TokenKind.LetKeyword]: "#d73a49",
  [TokenKind.Comma]: "rgb(78, 155, 86)",
  [TokenKind.Arrow]: "#6abba3",
  [TokenKind.Percent]: "#422c4f",
  [TokenKind.Newline]: "lightgray",
  [TokenKind.QuestionMark]: "#422c4f",
};

export const expressionColors: { [key in SyntaxKind]: string } = {
  BinaryExpression: "#422c4f",
  UnaryExpression: "#4f004e",
  NumericLiteral: "#015c6b",
  Identifier: "#005cc5",
  VariableDeclaration: "#0061b4",
  FunctionExpression: "#6446b9",
  FunctionCall: "rgb(58, 151, 10)",
  Program: "#c751c4",
  PrintExpression: "#422c4f",
};
