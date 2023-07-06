import { describe, expect, it } from "vitest";

import { SyntaxKind, Node } from "./ast";
import { TokenKind } from "./lexer";
import { parse } from "./test/test-utils";
import {
  BinaryExpression,
  UnaryExpression,
  NumericLiteral,
  Identifier,
  VariableDeclaration,
  FunctionExpression,
  CallExpression,
  Program,
} from "./factory";

const expectParsed = (expression: string, expected: Node) => {
  if (!("statements" in expected)) expected = Program([expected]);

  expect(parse(expression).statements).toStrictEqual(expected.statements);
};

describe("parser", () => {
  it("parses numeric literals", () => {
    expectParsed("1", {
      kind: "NumericLiteral",
      value: 1,
    });

    expectParsed("1000.0002", {
      kind: "NumericLiteral",
      value: 1000.0002,
    });
  });

  it("parses unary expressions", () => {
    expectParsed("-1.5", UnaryExpression(TokenKind.Minus, NumericLiteral(1.5)));
  });

  describe("arithmetic expressions", () => {
    it("parses multiplication", () => {
      expectParsed(
        "1 * 2",
        BinaryExpression(
          NumericLiteral(1),
          TokenKind.Asterisk,
          NumericLiteral(2)
        )
      );

      expectParsed("1 * 2 * 3", {
        kind: "BinaryExpression",
        operator: TokenKind.Asterisk,
        left: {
          kind: "BinaryExpression",
          operator: TokenKind.Asterisk,
          left: NumericLiteral(1),
          right: NumericLiteral(2),
        },
        right: NumericLiteral(3),
      });
    });

    it("parses exponentation", () => {
      expectParsed(
        "2 ** 3",
        BinaryExpression(
          NumericLiteral(2),
          TokenKind.AsteriskAsterisk,
          NumericLiteral(3)
        )
      );

      // 2 ^ (3 ^ 2)
      expectParsed(
        "2 ** 3 ** 2",
        BinaryExpression(
          NumericLiteral(2),
          TokenKind.AsteriskAsterisk,
          BinaryExpression(
            NumericLiteral(3),
            TokenKind.AsteriskAsterisk,
            NumericLiteral(2)
          )
        )
      );

      expectParsed(
        "10 ** 2 * 3",
        BinaryExpression(
          BinaryExpression(
            NumericLiteral(10),
            TokenKind.AsteriskAsterisk,
            NumericLiteral(2)
          ),
          TokenKind.Asterisk,
          NumericLiteral(3)
        )
      );

      expectParsed(
        "10 * 2 ** 3",
        BinaryExpression(
          NumericLiteral(10),
          TokenKind.Asterisk,
          BinaryExpression(
            NumericLiteral(2),
            TokenKind.AsteriskAsterisk,
            NumericLiteral(3)
          )
        )
      );
    });

    //  (parens, exponents, multiplications and division (from left to right), multiplication and subtraction (from left to right)
    it("satisfies PEMDAS", () => {
      expectParsed(
        "-1 * 2",
        BinaryExpression(
          UnaryExpression(TokenKind.Minus, NumericLiteral(1)),
          TokenKind.Asterisk,
          NumericLiteral(2)
        )
      );

      expectParsed(
        "1 + 2 * 2 + 1",
        BinaryExpression(
          BinaryExpression(
            NumericLiteral(1),
            TokenKind.Plus,
            BinaryExpression(
              NumericLiteral(2),
              TokenKind.Asterisk,
              NumericLiteral(2)
            )
          ),
          TokenKind.Plus,
          NumericLiteral(1)
        )
      );
    });
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

  it("parses assignments", () => {
    expectParsed(
      "a = 1",
      BinaryExpression(Identifier("a"), TokenKind.Equals, NumericLiteral(1))
    );
  });

  it("parses variable declarations", () => {
    expectParsed(
      "let a = 1",
      VariableDeclaration(Identifier("a"), NumericLiteral(1))
    );

    expectParsed(
      "let a = 1 + 2",
      VariableDeclaration(
        Identifier("a"),
        BinaryExpression(NumericLiteral(1), TokenKind.Plus, NumericLiteral(2))
      )
    );

    expectParsed(
      "let a = 1 + 2 * 3",
      VariableDeclaration(
        Identifier("a"),
        BinaryExpression(
          NumericLiteral(1),
          TokenKind.Plus,
          BinaryExpression(
            NumericLiteral(2),
            TokenKind.Asterisk,
            NumericLiteral(3)
          )
        )
      )
    );
  });

  it("parses function expression", () => {
    expectParsed(
      // noop
      "() => {}",
      FunctionExpression([], [])
    );

    expectParsed(
      "() => 1 + 2",
      FunctionExpression(
        [],
        [BinaryExpression(NumericLiteral(1), TokenKind.Plus, NumericLiteral(2))]
      )
    );

    expectParsed(
      "(b) => 1",
      FunctionExpression([Identifier("b")], [NumericLiteral(1)])
    );

    expectParsed(
      "(b, c) => 1",
      FunctionExpression(
        [Identifier("b"), Identifier("c")],
        [NumericLiteral(1)]
      )
    );

    expectParsed(
      "(b, c) => b + c",
      FunctionExpression(
        [Identifier("b"), Identifier("c")],
        [BinaryExpression(Identifier("b"), TokenKind.Plus, Identifier("c"))]
      )
    );

    expectParsed(
      "(b, c) => { b + c }",
      FunctionExpression(
        [Identifier("b"), Identifier("c")],
        [BinaryExpression(Identifier("b"), TokenKind.Plus, Identifier("c"))]
      )
    );

    expectParsed(
      `(b, c) => {
          b + c
          b - c
       }`,
      FunctionExpression(
        [Identifier("b"), Identifier("c")],
        [
          BinaryExpression(Identifier("b"), TokenKind.Plus, Identifier("c")),
          BinaryExpression(Identifier("b"), TokenKind.Minus, Identifier("c")),
        ]
      )
    );

    expectParsed(
      `(b, c) => {
          let x = b + c
          x
       }`,
      FunctionExpression(
        [Identifier("b"), Identifier("c")],
        [
          VariableDeclaration(
            Identifier("x"),
            BinaryExpression(Identifier("b"), TokenKind.Plus, Identifier("c"))
          ),
          Identifier("x"),
        ]
      )
    );
  });

  it("parses function declarations", () => {
    expectParsed(
      "let a = () => 1",
      VariableDeclaration(
        Identifier("a"),
        FunctionExpression([], [NumericLiteral(1)])
      )
    );

    expectParsed(
      "let a = (b) => 1",
      VariableDeclaration(
        Identifier("a"),
        FunctionExpression([Identifier("b")], [NumericLiteral(1)])
      )
    );

    expectParsed(
      "let a = (b, c) => { b + c }",
      VariableDeclaration(
        Identifier("a"),
        FunctionExpression(
          [Identifier("b"), Identifier("c")],
          [BinaryExpression(Identifier("b"), TokenKind.Plus, Identifier("c"))]
        )
      )
    );
  });

  it("parses function calls", () => {
    expectParsed("a()", CallExpression(Identifier("a"), []));

    expectParsed("a(b)", CallExpression(Identifier("a"), [Identifier("b")]));

    expectParsed(
      "a(b, c)",
      CallExpression(Identifier("a"), [Identifier("b"), Identifier("c")])
    );

    expectParsed(
      "a(b, c, d)",
      CallExpression(Identifier("a"), [
        Identifier("b"),
        Identifier("c"),
        Identifier("d"),
      ])
    );

    expectParsed(
      "a(1 + 2)",
      CallExpression(Identifier("a"), [
        BinaryExpression(NumericLiteral(1), TokenKind.Plus, NumericLiteral(2)),
      ])
    );

    expectParsed(
      "a(b + c)",
      CallExpression(Identifier("a"), [
        BinaryExpression(Identifier("b"), TokenKind.Plus, Identifier("c")),
      ])
    );

    expectParsed(
      "a(b, c + d)",
      CallExpression(Identifier("a"), [
        Identifier("b"),
        BinaryExpression(Identifier("c"), TokenKind.Plus, Identifier("d")),
      ])
    );
  });

  it("parses programs", () => {
    expectParsed("let a = 1", {
      kind: "Program",
      statements: [VariableDeclaration(Identifier("a"), NumericLiteral(1))],
    });

    expectParsed(
      `let a = 1
       let b = 2`,
      {
        kind: "Program",
        statements: [
          VariableDeclaration(Identifier("a"), NumericLiteral(1)),
          VariableDeclaration(Identifier("b"), NumericLiteral(2)),
        ],
      }
    );

    expectParsed(
      `let a = 1
       let b = 2
       let c = 3
      `,
      {
        kind: "Program",
        statements: [
          VariableDeclaration(Identifier("a"), NumericLiteral(1)),
          VariableDeclaration(Identifier("b"), NumericLiteral(2)),
          VariableDeclaration(Identifier("c"), NumericLiteral(3)),
        ],
      }
    );

    expectParsed(
      `let a = 1
       let b = 2
       let c = 3
       let d = 4`,
      {
        kind: "Program",
        statements: [
          VariableDeclaration(Identifier("a"), NumericLiteral(1)),
          VariableDeclaration(Identifier("b"), NumericLiteral(2)),
          VariableDeclaration(Identifier("c"), NumericLiteral(3)),
          VariableDeclaration(Identifier("d"), NumericLiteral(4)),
        ],
      }
    );

    expectParsed(
      `let a = () => 1
       let b = a
       let c = (d) => { a + 10 }`,
      {
        kind: "Program",
        statements: [
          VariableDeclaration(
            Identifier("a"),
            FunctionExpression([], [NumericLiteral(1)])
          ),
          VariableDeclaration(Identifier("b"), Identifier("a")),
          VariableDeclaration(
            Identifier("c"),
            FunctionExpression(
              [Identifier("d")],
              [
                BinaryExpression(
                  Identifier("a"),
                  TokenKind.Plus,
                  NumericLiteral(10)
                ),
              ]
            )
          ),
        ],
      }
    );
  });
});
