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

  useLayoutEffect(() => {
    if (pathname === "/") window.history.pushState({}, "", tabs[0].href);
  }, [pathname]);

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
  else ast = assignIds(parseResult, 0);

  const evaluationEvents: EvaluationEvents = [];
  let programResult: Value | undefined;
  try {
    programResult = ast && interpret(ast, astDebugger(evaluationEvents));
  } catch (_err) {}
  evaluationEvents.sort((a, b) => a.nid - b.nid);

  return (
    <main className="h-screen flex flex-row">
      <section className="resize-x overflow-auto w-1/2 border-r-2 mr-1">
        <Editor value={code} onChange={setCode} />
      </section>
      <section className="w-1/2 flex-1">
        <header className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => (
              <a
                key={tab.name}
                href={tab.href}
                className={cx(
                  tab.href === pathname
                    ? "border-gray-900 text-gray-900"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
                  "whitespace-nowrap border-b-[3px] py-4 px-1 font-medium"
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
            <Lexer tokens={tokens} tokenError={tokenError} />
          )}
          {pathname === "/parser" && (
            <AstViewer ast={ast} parseError={parseError} />
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
            />
          )}
        </article>
      </section>
    </main>
  );
};

const assignIds = <TNode extends ast.Node>(node: TNode, id: number): TNode => {
  const newNode = { ...node, id };
  switch (node.kind) {
    case "BinaryExpression":
      return {
        ...newNode,
        left: assignIds(node.left, id + 1),
        right: assignIds(node.right, id + 2),
      };
    case "UnaryExpression":
      return {
        ...newNode,
        operand: assignIds(node.operand, id + 1),
      };
    case "FunctionCall":
      return {
        ...newNode,
        name: assignIds(node.name, id + 1),
        arguments: node.arguments.map((arg, i) => assignIds(arg, id + i + 2)),
      };
    case "VariableDeclaration":
      return {
        ...newNode,
        name: assignIds(node.name, id + 1),
        initializer: assignIds(node.initializer, id + 2),
      };
    case "FunctionExpression":
      return {
        ...newNode,
        parameters: node.parameters.map((param, i) =>
          assignIds(param, id + i + 1)
        ),
        body: node.body.map((statement, i) => assignIds(statement, id + i + 2)),
      };
    case "Program":
      return {
        ...newNode,
        statements: node.statements.map((statement, i) =>
          assignIds(statement, id + i + 1)
        ),
      };
    default:
      return newNode;
  }
};
