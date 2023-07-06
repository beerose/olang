import { useEffect, useState } from "react";
import "./App.css";

import { lexer, TokenKind } from "../../src/lexer";
import { TokenError, Token } from "typescript-parsec";
import { AstViewer } from "./ast";

const tokenColors: { [key in TokenKind]: string } = {
  [TokenKind.Number]: "blue",
  [TokenKind.Equals]: "green",
  [TokenKind.Plus]: "red",
  [TokenKind.Minus]: "purple",
  [TokenKind.Asterisk]: "orange",
  [TokenKind.Percent]: "brown",
  [TokenKind.AsteriskAsterisk]: "pink",
  [TokenKind.RightSlash]: "lightblue",
  [TokenKind.LeftParen]: "midnightblue",
  [TokenKind.RightParen]: "midnightblue",
  [TokenKind.LeftBrace]: "lightcoral",
  [TokenKind.RightBrace]: "lightcoral",
  [TokenKind.Space]: "black",
  [TokenKind.Identifier]: "indianred",
  [TokenKind.LetKeyword]: "magenta",
  [TokenKind.Comma]: "darkblue",
  [TokenKind.Arrow]: "slategray",
  [TokenKind.Newline]: "gray",
};

const tokenToDisplayName: { [key in TokenKind]: string } = {
  [TokenKind.Number]: "Number",
  [TokenKind.Equals]: "Equals",
  [TokenKind.Plus]: "Plus",
  [TokenKind.Minus]: "Minus",
  [TokenKind.Asterisk]: "Asterisk",
  [TokenKind.Percent]: "Percent",
  [TokenKind.AsteriskAsterisk]: "AsteriskAsterisk",
  [TokenKind.RightSlash]: "RightSlash",
  [TokenKind.LeftParen]: "LeftParen",
  [TokenKind.RightParen]: "RightParen",
  [TokenKind.LeftBrace]: "LeftBrace",
  [TokenKind.RightBrace]: "RightBrace",
  [TokenKind.Space]: "Space",
  [TokenKind.Identifier]: "Identifier",
  [TokenKind.LetKeyword]: "LetKeyword",
  [TokenKind.Comma]: "Comma",
  [TokenKind.Newline]: "Newline",
  [TokenKind.Arrow]: "Arrow",
};

const App: React.FC = () => {
  const [code, setCode] = useState("");
  const [tokens, setTokens] = useState<Token<TokenKind>[] | undefined>(
    undefined
  );
  const [error, setError] = useState<TokenError | null>(null);

  useEffect(() => {
    setError(null);
    let lexerOutput: Token<TokenKind> | undefined;
    try {
      lexerOutput = lexer.parse(code);
      const currentTokens: (typeof lexerOutput)[] = [];
      while (lexerOutput) {
        currentTokens.push(lexerOutput);
        lexerOutput = lexerOutput.next;
      }
      setTokens(currentTokens.filter((t): t is Token<TokenKind> => !!t));
    } catch (e) {
      setError(e as TokenError);
      setTokens(undefined);
    }
  }, [code]);

  console.log({ tokens });

  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "80%",
          height: "100%",
          justifyContent: "center",
        }}
      >
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          rows={3}
          style={{
            fontFamily: "monospace",
            padding: "12px",
            marginBottom: "12px",
            background: "#eee",
            outline: "none",
            color: "black",
            fontSize: "16px",
            height: "74px",
          }}
        />
        <div
          style={{
            padding: "12px 0",
            overflow: "scroll",
            height: "74px",
          }}
        >
          {error ? (
            <div
              style={{
                color: "red",
                background: "white",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                padding: "12px",
              }}
            >
              {error.errorMessage}
              <span>
                Row: {error.pos?.rowBegin}:{error.pos?.rowEnd} Col:{" "}
                {error.pos?.columnBegin}:{error.pos?.columnEnd}
              </span>
            </div>
          ) : (
            <table>
              <tbody>
                <tr>
                  {tokens?.map((token, i) => (
                    <td
                      key={i}
                      style={{
                        color: tokenColors[token.kind],
                        background: "white",

                        height: "1rem",
                        border: "1px solid #ddd",
                        padding: "4px",
                      }}
                    >
                      {token.text}
                    </td>
                  ))}
                </tr>
                <tr style={{ height: "1rem" }}>
                  {tokens?.map((token, i) => (
                    <td
                      key={i}
                      style={{
                        color: tokenColors[token.kind],
                        background: "white",
                        height: "1rem",
                        border: "1px solid #ddd",
                        padding: "4px",
                      }}
                    >
                      {tokenToDisplayName[token.kind]}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          )}
        </div>
      </div>
      <AstViewer code={code} />
    </>
  );
};

export default App;
