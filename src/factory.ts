import * as ast from "./ast";

export function NumericLiteral(value: number): ast.NumericLiteral {
  return {
    kind: ast.SyntaxKind.NumericLiteral,
    value,
  };
}
