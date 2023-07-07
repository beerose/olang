import { useEffect, useState } from "react";
import * as ast from "../../src/ast";
import {
  ParseError,
  Token,
  expectEOF,
  expectSingleResult,
} from "typescript-parsec";
import { Program } from "../../src/parser";
import { TokenKind } from "../../src/lexer";
import { expressionColors } from "./colors";

function parse(lexerOutput: Token<TokenKind> | undefined) {
  const parserOutput = Program.parse(lexerOutput);
  try {
    return expectSingleResult(expectEOF(parserOutput));
  } catch (err) {
    console.error(err);
    throw err;
  }
}

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

export const ParseErrorMsg: React.FC<{ error: ParseError }> = ({ error }) => {
  // todo: make this prettier
  return (
    <div>
      {error.message} at line {error.pos?.rowBegin} column{" "}
      {error.pos?.columnBegin}
    </div>
  );
};

interface AstViewerProps {
  lexerOutput?: Token<TokenKind>;
  setParserOutput?: (parserOutput: ast.Program) => void;
}

export const AstViewer: React.FC<AstViewerProps> = ({
  lexerOutput,
  setParserOutput,
}) => {
  const [ast, setAst] = useState<ast.Program | undefined>(undefined);
  const [error, setError] = useState<ParseError | null>(null);

  useEffect(() => {
    if (!lexerOutput) return;
    try {
      const currentAst = parse(lexerOutput);
      setAst(currentAst);
      setParserOutput?.(currentAst);
      setError(null);
    } catch (e) {
      if (typeof e === "object" && e !== null && "pos" in e) {
        setError(e as unknown as ParseError);
      }
      console.error(e);
    }
  }, [lexerOutput, setParserOutput]);

  if (error) {
    return <ParseErrorMsg error={error} />;
  }

  if (!ast) {
    return null;
  }

  return renderNode(ast, 0);
};
