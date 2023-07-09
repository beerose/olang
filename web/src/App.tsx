import { useLayoutEffect, useState } from "react";
import { ParseError, Token, TokenError } from "typescript-parsec";

import * as ast from "../../src/ast";
import { TokenKind, lexer } from "../../src/lexer";

import {
  EvaluationEvents,
  Value,
  astDebugger,
  interpret,
} from "../../src/interpreter";
import * as parser from "../../src/parser";

import { AstViewer } from "./ast";
import { cx } from "./lib/cx";
import { Evaluator } from "./evaluator";
import { Lexer } from "./lexer";
import { useRouter } from "./lib/router";

import "./index.css";
import { Editor } from "./Editor";

const DEFAULT_CODE = `
let add = (a, b) => {
  a + b
}
add(1, 2)
`.trim();

const tabs = [
  { name: "Lexer", href: "/lexer" },
  { name: "Parser", href: "/parser" },
  { name: "Interpreter", href: "/interpreter" },
];

export const App = () => {
  const { pathname } = useRouter();
  const [code, setCode] = useState(DEFAULT_CODE);
  const [highlightRange, setHighlightRange] = useState<
    | {
        from: number;
        to: number;
      }
    | undefined
  >(undefined);

  useLayoutEffect(() => {
    if (pathname === "/") window.history.pushState({}, "", tabs[0]?.href);

    if (pathname === "/interpreter") {
      setHighlightRange({
        from: 0,
        to: code.length,
      });
    }
  }, [code.length, pathname]);

  const tokens: Token<TokenKind>[] = [];
  let tokenError: TokenError | undefined;
  try {
    let token = lexer.parse(code);
    while (token) {
      tokens.push(token);
      token = token.next;
    }
  } catch (err) {
    tokenError = err as TokenError;
  }

  let parseError: ParseError | undefined;
  let ast: ast.Program | undefined;

  const parseResult = parser.parse(code);

  if (parseResult.kind === "Error") parseError = parseResult;
  else ast = parseResult;

  const evaluationEvents: EvaluationEvents = [];
  let programResult: Value | undefined;
  try {
    programResult = ast && interpret(ast, astDebugger(evaluationEvents));
  } catch (_err) {
    /* empty */
  }
  evaluationEvents.reverse();

  return (
    <main className="h-screen flex flex-row">
      <section className="resize-x overflow-auto w-1/2 border-r-2 mr-1">
        <Editor
          value={code}
          onChange={setCode}
          highlightRange={highlightRange}
        />
      </section>
      <section className="w-1/2 flex-1">
        <header className="border-b border-gray-200">
          <nav className="flex gap-1" aria-label="Tabs">
            {tabs.map((tab) => (
              <a
                key={tab.name}
                href={tab.href}
                className={cx(
                  tab.href === pathname
                    ? "border-gray-900 text-gray-900"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
                  "whitespace-nowrap border-b-[3px] px-4 py-3 font-medium"
                )}
                aria-current={tab.href === pathname ? "page" : undefined}
              >
                {tab.name}
              </a>
            ))}
          </nav>
        </header>
        <article>
          {pathname === "/lexer" && (
            <Lexer
              tokens={tokens}
              tokenError={tokenError}
              setHighlightRange={setHighlightRange}
            />
          )}
          {pathname === "/parser" && (
            <AstViewer
              ast={ast}
              parseError={parseError}
              setHighlightRange={setHighlightRange}
            />
          )}
          {pathname === "/interpreter" && (
            <Evaluator
              ast={ast}
              error={
                // TODO: runtime execution error?
                parseError
              }
              evaluationEvents={evaluationEvents}
              result={programResult}
              setHighlightRange={setHighlightRange}
            />
          )}
        </article>
      </section>
    </main>
  );
};
