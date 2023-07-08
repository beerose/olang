import { Token, TokenError } from "typescript-parsec";
import { TokenKind } from "../../src/lexer";
import { tokenColors } from "./colors";
import { unsafeEntries } from "./lib/unsafeEntries";

const tokenToDisplayName = Object.fromEntries(
  unsafeEntries(TokenKind).map(([key, value]) => [value, key])
) as { [key in TokenKind]: string };

export function Lexer({
  tokens,
  tokenError: error,
  setHighlightRange,
}: {
  tokens: Token<TokenKind>[] | undefined;
  tokenError: TokenError | undefined;
  setHighlightRange: (range: { from: number; to: number }) => void;
}) {
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
        <div className="flex flex-wrap py-2 gap-1">
          {tokens?.map((token, i) => (
            <button
              key={i}
              onClick={() => {
                setHighlightRange({
                  from: token.pos.index,
                  to: token.pos.index + token.text.length,
                });
              }}
              className="text-white px-1.5 py-1 text-xs rounded-md hover:shadow-md hover:opacity-90 transition-opacity"
              style={{ background: tokenColors[token.kind] }}
            >
              {token.kind === TokenKind.Identifier ||
              token.kind === TokenKind.Number ? (
                <>
                  {tokenToDisplayName[token.kind]}: {token.text}
                </>
              ) : (
                tokenToDisplayName[token.kind]
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
