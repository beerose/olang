import * as ast from "../../src/ast";
import { ParseError } from "typescript-parsec";
import { expressionColors } from "./colors";

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
        className={`border border-black ${indentLevel > 0 ? "w-full" : ""}`}
      >
        <tbody>
          <tr>
            <td className="font-extrabold border-b border-black p-2 pb-1 pr-1">
              {node.kind}
            </td>
          </tr>
          {Object.entries(node)
            .filter(([key]) => key !== "kind")
            .map(([key, value]) => {
              if (Array.isArray(value)) {
                return (
                  <tr key={key}>
                    <td className="p-2 pb-1 pr-1">
                      <span
                        style={{ marginLeft: `${(indentLevel + 1) * 20}px` }}
                      >
                        {key}:
                      </span>
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
                    <td className="p-2 pb-1 pr-1">
                      <span
                        style={{ marginLeft: `${(indentLevel + 1) * 20}px` }}
                      >
                        {key}:
                      </span>
                      {renderNode(value, indentLevel + 1)}
                    </td>
                  </tr>
                );
              } else {
                return (
                  <tr key={key}>
                    <td className="p-2 pb-1 pr-1">
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

export const ParseErrorMsg = ({ error }: { error: ParseError }) => {
  // todo: make this prettier
  return (
    <div>
      {error.message} at line {error.pos?.rowBegin} column{" "}
      {error.pos?.columnBegin}
    </div>
  );
};

interface AstViewerProps {
  ast: ast.Program | undefined;
  parseError: ParseError | undefined;
}

export const AstViewer = ({ ast, parseError }: AstViewerProps) => {
  if (parseError) {
    return <ParseErrorMsg error={parseError} />;
  }

  if (!ast) {
    return null;
  }

  return renderNode(ast, 0);
};
