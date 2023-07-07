import { useEffect, useState } from "react";
import { Token, TokenError } from "typescript-parsec";
import { TokenKind, lexer } from "../../src/lexer";
import { tokenColors } from "./colors";

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

export function Lexer({
  code,
  setLexerOutput,
}: {
  code: string;
  setLexerOutput: (tokens: Token<TokenKind> | undefined) => void;
}) {
  const [tokens, setTokens] = useState<Token<TokenKind>[] | undefined>(
    undefined
  );
  const [error, setError] = useState<TokenError | null>(null);

  useEffect(() => {
    setError(null);
    let lexerOutput: Token<TokenKind> | undefined;
    try {
      lexerOutput = lexer.parse(code);
      setLexerOutput(lexerOutput);
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
  }, [code, setLexerOutput]);

  return (
    <div className="overflow-scroll text-center flex flex-wrap">
      {error ? (
        <div className="text-left text-red-500 flex flex-col items-start p-3">
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
                  className="border border-black p-3 font-extrabold"
                  style={{ color: tokenColors[token.kind] }}
                >
                  {token.text}
                </td>
              ))}
            </tr>
            <tr>
              {tokens?.map((token, i) => (
                <td
                  key={i}
                  className="border border-black p-3 font-extrabold"
                  style={{ color: tokenColors[token.kind] }}
                >
                  {tokenToDisplayName[token.kind]}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      )}
    </div>
  );
}
