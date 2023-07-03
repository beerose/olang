import { useEffect, useState } from "react";
import * as ast from "../../src/ast";
import { printAST } from "../../src/parser";

const expressionColors: Record<ast.SyntaxKind, string> = {
  [ast.SyntaxKind.BinaryExpression]: "blue",
  [ast.SyntaxKind.UnaryExpression]: "green",
  [ast.SyntaxKind.NumericLiteral]: "red",
  [ast.SyntaxKind.Identifier]: "purple",
  [ast.SyntaxKind.VariableDeclaration]: "orange",
  [ast.SyntaxKind.Function]: "brown",
  [ast.SyntaxKind.FunctionParameters]: "pink",
  [ast.SyntaxKind.FunctionCall]: "gray",
  [ast.SyntaxKind.Block]: "magenta",
};

const renderNode = (node: ast.Node, indentLevel: number) => {
  const color = expressionColors[node.kind];
  return (
    <div style={{ marginLeft: `${indentLevel * 20}px`, color }}>
      <table style={{ border: "1px solid black", width: "100%" }}>
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

export const AstViewer: React.FC<AstViewerProps> = ({ code }) => {
  const [ast, setAst] = useState<ast.Node | undefined>(undefined);
  useEffect(() => {
    if (!code) return;
    try {
      const currentAst = printAST(code);
      setAst(currentAst);
    } catch (e) {
      console.error(e);
    }
  }, [code]);

  return <div>{ast && renderNode(ast, 0)}</div>;
};
