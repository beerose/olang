import { describe, expect, it } from "vitest";
import { expectEOF, expectSingleResult, TokenError } from "typescript-parsec";

import * as parser from "./parser";

import { SyntaxKind, Node } from "./ast";
import { TokenKind } from "./lexer";
import { NumericLiteral } from "./factory";

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
    expectParsed("-1.5", {
      kind: SyntaxKind.UnaryExpression,
      operator: TokenKind.Minus,
      operand: {
        kind: SyntaxKind.NumericLiteral,
        value: 1.5,
      },
    });
  });

  it("parses binary expressions", () => {
    expectParsed("1 * 2", {
      kind: SyntaxKind.BinaryExpression,
      operator: TokenKind.Asterisk,
      left: {
        kind: SyntaxKind.NumericLiteral,
        value: 1,
      },
      right: {
        kind: SyntaxKind.NumericLiteral,
        value: 2,
      },
    });

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

    // expectParsed("1 + 2 * 3", {
    //   kind: SyntaxKind.BinaryExpression,
    //   operator: TokenKind.Plus,
    //   left: NumericLiteral(1),
    //   right: {
    //     kind: SyntaxKind.BinaryExpression,
    //     operator: TokenKind.Asterisk,
    //     left: NumericLiteral(2),
    //     right: NumericLiteral(3),
    //   },
    // });

    expectParsed("1 * 2 + 3", )
  });
});
