import { useEffect, useState } from "react";
import * as ast from "../../src/ast";
import { Program } from "../../src/parser";
import { ParseError, expectEOF, expectSingleResult } from "typescript-parsec";
import { lexer } from "../../src/lexer";

const printAST = (code: string) => {
  const ast = Program.parse(lexer.parse(code));
  return expectSingleResult(expectEOF(ast));
};

const expressionColors: { [key in ast.SyntaxKind]: string } = {
  BinaryExpression: "blue",
  UnaryExpression: "green",
  NumericLiteral: "red",
  Identifier: "purple",
  VariableDeclaration: "midnightblue",
  Function: "brown",
  FunctionParameters: "pink",
  FunctionCall: "gray",
  Program: "lightblue",
};

const renderNode = (node: ast.Node, indentLevel: number) => {
  const color = expressionColors[node.kind];
  return (
    <div
      style={{
        marginLeft: `${indentLevel * 20}px`,
        color,
      }}
    >
      <table
        style={{
          border: "1px solid black",
          width: indentLevel > 0 ? "100%" : "inherit",
          background: "white",
        }}
      >
        <tbody>
          <tr>
            <td style={{ fontWeight: "bold", borderBottom: "1px solid black" }}>
              {node.kind}
            </td>
          </tr>
          {Object.entries(node)
            .filter(([key]) => key !== "kind")
            .map(([key, value]) => {
              if (Array.isArray(value)) {
                return (
                  <tr key={key}>
                    <td>
                      {key}:
                      {value.map((item, i) => (
                        <div key={`${key}-${i}`}>
                          {renderNode(item, indentLevel + 1)}
                        </div>
                      ))}
                    </td>
                  </tr>
                );
              } else if (typeof value === "object" && value !== null) {
                return (
                  <tr key={key}>
                    <td>
                      {key}:{renderNode(value, indentLevel + 1)}
                    </td>
                  </tr>
                );
              } else {
                return (
                  <tr key={key}>
                    <td>
                      {key}: {value}
                    </td>
                  </tr>
                );
              }
            })}
        </tbody>
      </table>
    </div>
  );
};

interface AstViewerProps {
  code: string;
}

export const ParseErrorMsg: React.FC<{ error: ParseError }> = ({ error }) => {
  return (
    <div>
      {error.message} at line {error.pos?.rowBegin} column{" "}
      {error.pos?.columnBegin}
    </div>
  );
};

export const AstViewer: React.FC<AstViewerProps> = ({ code }) => {
  const [ast, setAst] = useState<ast.Node | undefined>(undefined);
  const [error, setError] = useState<ParseError | null>(null);

  useEffect(() => {
    if (!code) return;
    try {
      const currentAst = printAST(code);
      setAst(currentAst);
    } catch (e) {
      if (typeof e === "object" && e !== null && "pos" in e) {
        setError(e as unknown as ParseError);
      }
      console.error(e);
    }
  }, [code]);

  if (error) {
    return <ParseErrorMsg error={error} />;
  }

  return ast ? renderNode(ast, 0) : null;
};
