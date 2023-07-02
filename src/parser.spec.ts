import { describe, expect, it } from "vitest";
import { expectEOF, expectSingleResult } from "typescript-parsec";

import * as parser from "./parser";

import { SyntaxKind, Node } from "./ast";
import { TokenKind } from "./lexer";
import {
  BinaryExpression,
  UnaryExpression,
  NumericLiteral,
  Identifier,
} from "./factory";

const expectParsed = (expression: string, expected: Node) => {
  const results = parser.parse(expression);

  try {
    expect(expectSingleResult(expectEOF(results))).toStrictEqual(expected);
  } catch (err) {
    if (
      typeof err === "object" &&
      err !== null &&
      "errorMessage" in err &&
      err.errorMessage === "Multiple results are returned."
    ) {
      console.dir({ results }, { depth: 99 });
    }

    console.dir({ results }, { depth: 5 });
    throw err;
  }
};

describe("parser", () => {
  it("parses numeric literals", () => {
    expectParsed("1", {
      kind: SyntaxKind.NumericLiteral,
      value: 1,
    });

    expectParsed("1000.0002", {
      kind: SyntaxKind.NumericLiteral,
      value: 1000.0002,
    });
  });

  it("parses unary expressions", () => {
    expectParsed("-1.5", UnaryExpression(TokenKind.Minus, NumericLiteral(1.5)));
  });

  it("parses binary expressions", () => {
    expectParsed(
      "1 * 2",
      BinaryExpression(NumericLiteral(1), TokenKind.Asterisk, NumericLiteral(2))
    );

    expectParsed("1 * 2 * 3", {
      kind: SyntaxKind.BinaryExpression,
      operator: TokenKind.Asterisk,
      left: {
        kind: SyntaxKind.BinaryExpression,
        operator: TokenKind.Asterisk,
        left: NumericLiteral(1),
        right: NumericLiteral(2),
      },
      right: NumericLiteral(3),
    });

    expectParsed(
      "1 + 2 * 3",
      BinaryExpression(
        NumericLiteral(1),
        TokenKind.Plus,
        BinaryExpression(
          NumericLiteral(2),
          TokenKind.Asterisk,
          NumericLiteral(3)
        )
      )
    );

    expectParsed(
      "1 * 2 + 3",
      BinaryExpression(
        BinaryExpression(
          NumericLiteral(1),
          TokenKind.Asterisk,
          NumericLiteral(2)
        ),
        TokenKind.Plus,
        NumericLiteral(3)
      )
    );

    expectParsed(
      "-1 * 2",
      BinaryExpression(
        UnaryExpression(TokenKind.Minus, NumericLiteral(1)),
        TokenKind.Asterisk,
        NumericLiteral(2)
      )
    );
  });

  it("parses parentheses", () => {
    expectParsed("(1)", NumericLiteral(1));

    expectParsed(
      "(1 + 2)",
      BinaryExpression(NumericLiteral(1), TokenKind.Plus, NumericLiteral(2))
    );

    expectParsed(
      "1 * (2 + 3)",
      BinaryExpression(
        NumericLiteral(1),
        TokenKind.Asterisk,
        BinaryExpression(NumericLiteral(2), TokenKind.Plus, NumericLiteral(3))
      )
    );

    expectParsed(
      "(1 + 2) * 3",
      BinaryExpression(
        BinaryExpression(NumericLiteral(1), TokenKind.Plus, NumericLiteral(2)),
        TokenKind.Asterisk,
        NumericLiteral(3)
      )
    );
  });

  it("parses identifiers", () => {
    expectParsed("a", Identifier("a"));

    expectParsed(
      "a + b",
      BinaryExpression(Identifier("a"), TokenKind.Plus, Identifier("b"))
    );

    expectParsed(
      "a + b * c",
      BinaryExpression(
        Identifier("a"),
        TokenKind.Plus,
        BinaryExpression(Identifier("b"), TokenKind.Asterisk, Identifier("c"))
      )
    );

    expectParsed(
      "a * b + c",
      BinaryExpression(
        BinaryExpression(Identifier("a"), TokenKind.Asterisk, Identifier("b")),
        TokenKind.Plus,
        Identifier("c")
      )
    );

    expectParsed(
      "a * (b + c) / 2",
      BinaryExpression(
        BinaryExpression(
          Identifier("a"),
          TokenKind.Asterisk,
          BinaryExpression(Identifier("b"), TokenKind.Plus, Identifier("c"))
        ),
        TokenKind.RightSlash,
        NumericLiteral(2)
      )
    );

    expectParsed(
      "2 * (a + b) * c",
      BinaryExpression(
        BinaryExpression(
          NumericLiteral(2),
          TokenKind.Asterisk,
          BinaryExpression(Identifier("a"), TokenKind.Plus, Identifier("b"))
        ),
        TokenKind.Asterisk,
        Identifier("c")
      )
    );
  });
});
