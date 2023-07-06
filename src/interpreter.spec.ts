import { describe, expect, it } from "vitest";
import { interpret } from "./interpreter";
import { parse } from "./test/test-utils";

const expectEvaluated = (source: string, expected: unknown) => {
  expect(interpret(parse(source))).toBe(expected);
};

describe(interpret, () => {
  it("evaluates arithmetic", () => {
    expectEvaluated("1", 1);

    expectEvaluated("2 + 3", 5);

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

    expectEvaluated("2 * 3 ** 2", 18);

    expectEvaluated("-1", -1);

    expectEvaluated("-1 + 2", 1);
  });

  it("evaluates functions", () => {
    expectEvaluated(
      `
      let inc = (x) => x + 1
      inc(1)
      `,
      2
    );

    expectEvaluated(
      `
      let square = (x) => {
        x ** 2
      }
      let inc = (x) => x + 1
      let main = (x) => {
        let y = inc(x)
        square(y)
      }
      main(11)
      `,
      144
    );
  });
});
