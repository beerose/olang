import CodeMirror, { ReactCodeMirrorProps } from "@uiw/react-codemirror";
import { parser as javascriptParser } from "@lezer/javascript";

import { githubLight } from "@uiw/codemirror-theme-github";
import {
  LRLanguage,
  LanguageSupport,
  delimitedIndent,
  continuedIndent,
  indentNodeProp,
  foldNodeProp,
  foldInside,
} from "@codemirror/language";

const codemirrorOlangSupport = new LanguageSupport(
  LRLanguage.define({
    name: "olang",
    languageData: {
      closeBrackets: { brackets: ["(", "[", "{", "'", '"', "`"] },
      commentTokens: { line: "//", block: { open: "/*", close: "*/" } },
      indentOnInput: /^\s*(?:case |default:|\{|\}|<\/)$/,
      wordChars: "$",
    },
    parser: javascriptParser.configure({
      props: [
        indentNodeProp.add({
          IfStatement: continuedIndent({ except: /^\s*({|else\b)/ }),
          TryStatement: continuedIndent({
            except: /^\s*({|catch\b|finally\b)/,
          }),
          SwitchBody: (context) => {
            const after = context.textAfter,
              closed = /^\s*\}/.test(after),
              isCase = /^\s*(case|default)\b/.test(after);
            return (
              context.baseIndent + (closed ? 0 : isCase ? 1 : 2) * context.unit
            );
          },
          Block: delimitedIndent({ closing: "}" }),
          ArrowFunction: (cx) => cx.baseIndent + cx.unit,
          "TemplateString BlockComment": () => null,
          "Statement Property": continuedIndent({ except: /^{/ }),
        }),
        foldNodeProp.add({
          "Block ClassBody SwitchBody EnumBody ObjectExpression ArrayExpression ObjectType":
            foldInside,
          BlockComment(tree) {
            return { from: tree.from + 2, to: tree.to - 2 };
          },
        }),
      ],
    }),
  })
);

const extensions: ReactCodeMirrorProps["extensions"] = [codemirrorOlangSupport];

export function Editor(props: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <CodeMirror
      value={props.value}
      onChange={props.onChange}
      className="h-full [&>div]:h-full"
      theme={githubLight}
      extensions={extensions}
    />
  );
}
