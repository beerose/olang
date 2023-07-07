import { useState } from "react";

import { AstViewer } from "./ast";
import { Evaluator } from "./evaluator";
import { Lexer } from "./lexer";
import { Token } from "typescript-parsec";
import { TokenKind } from "../../src/lexer";
import * as ast from "../../src/ast";
import "./index.css";

const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState(tabs[0].name);
  const [code, setCode] = useState("");
  const [lexerOutput, setLexerOutput] = useState<Token<TokenKind> | undefined>(
    undefined
  );
  const [parserOutput, setParserOutput] = useState<ast.Program | undefined>(
    undefined
  );

  return (
    <div className="p-20 space-y-4">
      <div className="flex flex-col h-full w-full">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          rows={3}
          style={{
            fontFamily: "monospace",
            padding: "12px",
            marginBottom: "12px",
            background: "#eee",
            color: "black",
            fontSize: "16px",
            height: "74px",
          }}
        />
      </div>
      <div>
        <div className="hidden sm:block">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              {tabs.map((tab) => (
                <a
                  key={tab.name}
                  href={tab.href}
                  className={classNames(
                    tab.name === currentTab
                      ? "border-gray-900 text-gray-900"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700",
                    "whitespace-nowrap border-b-[3px] py-4 px-1 font-medium"
                  )}
                  aria-current={tab.name === currentTab ? "page" : undefined}
                  onClick={() => setCurrentTab(tab.name)}
                >
                  {tab.name}
                </a>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {currentTab === "Lexer" && (
        <Lexer code={code} setLexerOutput={setLexerOutput} />
      )}
      {currentTab === "Parser" && (
        <AstViewer
          lexerOutput={lexerOutput}
          setParserOutput={setParserOutput}
        />
      )}
      {currentTab === "Interpreter" && (
        <Evaluator parserOutput={parserOutput} />
      )}
    </div>
  );
};

/*
  This example requires some changes to your config:
  
  ```
  // tailwind.config.js
  module.exports = {
    // ...
    plugins: [
      // ...
      require('@tailwindcss/forms'),
    ],
  }
  ```
*/
const tabs = [
  { name: "Lexer", href: "#" },
  { name: "Parser", href: "#" },
  { name: "Interpreter", href: "#" },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default App;
