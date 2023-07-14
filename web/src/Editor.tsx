import CodeMirror, {
  ReactCodeMirrorRef,
  ReactCodeMirrorProps,
} from "@uiw/react-codemirror";
import { parser as javascriptParser } from "@lezer/javascript";
import { StateField, StateEffect, Extension } from "@codemirror/state";

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
import { Decoration, DecorationSet, EditorView } from "@codemirror/view";
import { useLayoutEffect, useRef } from "react";

const addHighlight = StateEffect.define<{ from: number; to: number }>({
  map: ({ from, to }, change) => ({
    from: change.mapPos(from),
    to: change.mapPos(to),
  }),
});
const highlightMark = Decoration.mark({ class: "highlight-mark" });
const highlightField = StateField.define<DecorationSet>({
  create() {
    return Decoration.none;
  },
  update(highlights, transaction) {
    highlights = highlights.map(transaction.changes);
    for (const e of transaction.effects) {
      if (e.is(addHighlight)) {
        highlights = Decoration.set(
          highlightMark.range(e.value.from, e.value.to)
        );
      }
    }
    return highlights;
  },
  provide: (stateField) => EditorView.decorations.from(stateField),
});

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

const extensions: ReactCodeMirrorProps["extensions"] = [
  highlightField,
  codemirrorOlangSupport,
  EditorView.baseTheme({
    ".highlight-mark": {
      backgroundColor: "#ffff0077",
      outline: "1px solid #00000022",
      borderRadius: "2px",
    },
  }),
];

export function Editor(props: {
  value: string;
  onChange: (value: string) => void;
  highlightRange: { from: number; to: number } | undefined;
}) {
  const editorRef = useRef<ReactCodeMirrorRef>(null);

  useLayoutEffect(() => {
    const view = editorRef.current?.view;

    if (!view) return;

    const from = props.highlightRange?.from;
    const to = props.highlightRange?.to;

    if (from === undefined || to === undefined) return;
    if (from === to) return;

    const effects: StateEffect<{ from: number; to: number } | Extension>[] = [
      addHighlight.of({ from, to }),
    ];
    if (!view.state.field(highlightField, false)) {
      // todo: learn why does this have to be defined in two places
      effects.push(StateEffect.appendConfig.of([highlightField]));
    }

    view.dispatch({ effects });
  }, [props.highlightRange, editorRef]);

  return (
    <CodeMirror
      ref={editorRef}
      onCreateEditor={(editor) => {
        const from = props.highlightRange?.from;
        const to = props.highlightRange?.to;
        if (from !== undefined && to !== undefined) {
          editor.dispatch({
            effects: [addHighlight.of({ from, to })],
          });
        }
      }}
      value={props.value}
      onChange={props.onChange}
      className="h-full [&>div]:h-full"
      theme={githubLight}
      extensions={extensions || []}
      autoFocus
    />
  );
}
