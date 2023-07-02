import { describe, expect, it } from "vitest";
import { evaluate } from "./interpreter";
import { printAST } from "./parser";

const expectEvaluated = (expr: string, expected: number) => {
  const ast = printAST(expr);
  expect(evaluate(ast)).toBe(expected);
};

describe("evaluate", () => {
  it("evaluates simple binary expressions", () => {
    expectEvaluated("1 + 1", 2);

    expectEvaluated("1 + 2 * 3", 7);

    expectEvaluated("1 + 2 * 18", 37);

    expectEvaluated("1 + 2 * 18 / 3", 13);

    expectEvaluated("1 + 2 * 18 / 3 * 2", 25);

    expectEvaluated("2 ** 2", 4);

    expectEvaluated("2 ** 3", 8);

    expectEvaluated("2 ** 3 ** 2", 512);

    expectEvaluated("2 ** 3 ** 2 ** 2", 2.4178516392292583e24);

    expectEvaluated("(1 + 2) * 3", 9);

    expectEvaluated("1 + 2 * (3 + 4)", 15);
  });

  it("evaluates unary expressions", () => {
    expectEvaluated("-1", -1);

    expectEvaluated("-1 + 2", 1);
  });
});
