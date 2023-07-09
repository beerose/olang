import * as ast from "../../src/ast";
import { ParseError, TokenError } from "typescript-parsec";
import { expressionColors } from "./colors";
import { Error } from "./error";

const ASTNode = ({
  node,
  indentLevel,
  setHighlightRange,
}: {
  node: ast.Node;
  indentLevel: number;
  setHighlightRange: (range: { from: number; to: number }) => void;
}) => {
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
              <button
                onClick={() => {
                  if (
                    typeof node.meta.from !== "number" ||
                    typeof node.meta.to !== "number"
                  ) {
                    return;
                  }
                  setHighlightRange({
                    from: node.meta.from,
                    to: node.meta.to,
                  });
                }}
              >
                {node.kind}
              </button>
            </td>
          </tr>
          {Object.entries(node)
            .filter(([key]) => key !== "kind")
            .map(([key, value]) => {
              if (key === "meta") {
                return null;
              }
              if (Array.isArray(value)) {
                return (
                  <tr key={key}>
                    <td className="p-2 pb-1 pr-1">
                      {key}:
                      {value.map((item, i) => (
                        <div key={`${key}-${i}`}>
                          <ASTNode
                            node={item}
                            indentLevel={indentLevel + 1}
                            setHighlightRange={setHighlightRange}
                          />
                        </div>
                      ))}
                    </td>
                  </tr>
                );
              } else if (typeof value === "object" && value !== null) {
                return (
                  <tr key={key}>
                    <td className="p-2 pb-1 pr-1">
                      {key}:
                      <ASTNode
                        node={value}
                        indentLevel={indentLevel + 1}
                        setHighlightRange={setHighlightRange}
                      />
                    </td>
                  </tr>
                );
              } else {
                return (
                  <tr key={key}>
                    {key}: {value}
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
  ast: ast.Program | undefined;
  parseError: ParseError | undefined;
  lexerError: TokenError | undefined;
  setHighlightRange: (range: { from: number; to: number }) => void;
}

export const AstViewer = ({
  ast,
  parseError,
  lexerError,
  setHighlightRange,
}: AstViewerProps) => {
  if (parseError || lexerError) {
    return <Error parseError={parseError} tokenError={lexerError} />;
  }

  if (!ast) {
    return null;
  }

  return (
    <div className="p-3">
      <ASTNode
        node={ast}
        indentLevel={0}
        setHighlightRange={setHighlightRange}
      />
    </div>
  );
};
