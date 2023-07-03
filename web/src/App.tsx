import { useEffect, useState } from "react";
import "./App.css";

import { lexer, TokenKind } from "../../src/lexer";
import { Token } from "typescript-parsec";

const tokenColors: { [key in TokenKind]: string } = {
  [TokenKind.Number]: "blue",
  [TokenKind.Equals]: "green",
  [TokenKind.Plus]: "red",
  [TokenKind.Minus]: "purple",
  [TokenKind.Asterisk]: "orange",
  [TokenKind.Percent]: "brown",
  [TokenKind.AsteriskAsterisk]: "pink",
  [TokenKind.RightSlash]: "lightblue",
  [TokenKind.LeftParen]: "lightgreen",
  [TokenKind.RightParen]: "lightgreen",
  [TokenKind.LeftBrace]: "lightcoral",
  [TokenKind.RightBrace]: "lightcoral",
  [TokenKind.Space]: "black",
  [TokenKind.Identifier]: "indianred",
  [TokenKind.LetKeyword]: "magenta",
  [TokenKind.Comma]: "darkblue",
  [TokenKind.Semicolon]: "darkgreen",
  [TokenKind.Arrow]: "yellow",
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
  [TokenKind.Semicolon]: "Semicolon",
  [TokenKind.Arrow]: "Arrow",
};

const App: React.FC = () => {
  const [code, setCode] = useState("");
  const [tokens, setTokens] = useState<Token<TokenKind>[] | undefined>(
    undefined
  );

  useEffect(() => {
    let lexerOutput = lexer.parse(code);
    console.log(lexerOutput);
    const currentTokens: (typeof lexerOutput)[] = [];
    while (lexerOutput) {
      currentTokens.push(lexerOutput);
      lexerOutput = lexerOutput.next;
    }
    setTokens(currentTokens.filter((t): t is Token<TokenKind> => !!t));
  }, [code]);

  console.log({ tokens });

  return (
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
      </div>
    </div>
  );
};

export default App;
