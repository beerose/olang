import { useState } from "react";
import "./App.css";

import { AstViewer } from "./ast";
import { Evaluator } from "./evaluator";
import { Lexer } from "./lexer";
import { Token } from "typescript-parsec";
import { TokenKind } from "../../src/lexer";
import * as ast from "../../src/ast";

const App: React.FC = () => {
  const [code, setCode] = useState("");
  const [lexerOutput, setLexerOutput] = useState<Token<TokenKind> | undefined>(
    undefined
  );
  const [parserOutput, setParserOutput] = useState<ast.Program | undefined>(
    undefined
  );

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
      </div>
      <Lexer code={code} setLexerOutput={setLexerOutput} />
      <AstViewer lexerOutput={lexerOutput} setParserOutput={setParserOutput} />
      <Evaluator parserOutput={parserOutput} />
    </>
  );
};

export default App;
