/* eslint-disable no-case-declarations */
import { useState } from "react";
import * as ast from "../../src/ast";
import { ParseError } from "typescript-parsec";
import { type EvaluationEvents, Value } from "../../src/interpreter";
import { unsafeEntries } from "./lib/unsafeEntries";

export function Evaluator({
  ast: ast,
  result,
  error: error,
  evaluationEvents: events,
}: {
  ast: ast.Program | undefined;
  result: Value;
  error: ParseError | undefined;
  evaluationEvents: EvaluationEvents;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const onNext = () => {
    setCurrentIndex((index) => (index + 1 < events.length ? index + 1 : index));
  };

  const onPrev = () => {
    setCurrentIndex((index) => (index - 1 >= 0 ? index - 1 : index));
  };

  if (error) {
    return (
      <div>
        <pre>{error.message}</pre>
      </div>
    );
  }

  if (!ast || error) {
    return <div>Evaluating...</div>;
  }

  return (
    <div>
      <AstNode node={ast} currentNodeId={events[currentIndex]?.nid} />
      <output>{JSON.stringify(result)}</output>
      <div>
        <h2 className="font-extrabold py-4">Evaluation steps</h2>

        <EventInfo event={events[currentIndex]} />
        <span className="isolate inline-flex rounded-md shadow-sm">
          <button
            type="button"
            className="relative inline-flex items-center rounded-l-md bg-white px-2 py-1  text-gray-900 ring-1 ring-inset ring-gray-500 hover:bg-gray-100 focus:z-10"
            onClick={onPrev}
            disabled={currentIndex === 0}
          >
            <span className="sr-only">Previous</span>
            Prev
          </button>
          <button
            type="button"
            className="relative -ml-px inline-flex items-center rounded-r-md bg-white px-2 py-1 text-gray-900 ring-1 ring-inset ring-gray-500 hover:bg-gray-100 focus:z-10"
            onClick={onNext}
          >
            <span className="sr-only">Next</span>
            Next
          </button>
        </span>
      </div>
    </div>
  );
}

const AstNode = ({
  node,
  currentNodeId,
}: {
  node: ast.Node & { id?: number };
  currentNodeId: number;
}) => {
  // TODO: Ensure that the .id is really needed here.
  const isCurrent = node.id === currentNodeId;
  const style = isCurrent ? { background: "yellow", color: "black" } : {};

  switch (node.kind) {
    case "Program":
      return (
        <span style={style}>
          {node.statements.map((childNode, i) => (
            <AstNode key={i} node={childNode} currentNodeId={currentNodeId} />
          ))}
        </span>
      );
    case "BinaryExpression":
      return (
        <span style={style}>
          {<AstNode node={node.left} currentNodeId={currentNodeId} />}
          {node.operator}
          {<AstNode node={node.right} currentNodeId={currentNodeId} />}
        </span>
      );
    case "UnaryExpression":
      return (
        <span style={style}>
          -{<AstNode node={node.operand} currentNodeId={currentNodeId} />}
        </span>
      );
    case "NumericLiteral":
      return <span style={style}>{node.value}</span>;
    case "Identifier":
      return <span style={style}>{node.name}</span>;
    case "VariableDeclaration":
      return (
        <span style={style}>
          let {node.name.name} ={" "}
          {<AstNode node={node.initializer} currentNodeId={currentNodeId} />}
        </span>
      );
    case "FunctionExpression":
      let body;
      if (node.body.length === 1) {
        body = <AstNode node={node.body[0]} currentNodeId={currentNodeId} />;
      } else {
        body = (
          <span>
            {"{"}
            <br />
            {node.body.map((childNode, i) => (
              <>
                <AstNode
                  key={i}
                  node={childNode}
                  currentNodeId={currentNodeId}
                />
                <br />
              </>
            ))}
            {"}"}
          </span>
        );
      }
      return (
        <span style={style}>
          (
          {node.parameters

            .map((childNode, i) => (
              <AstNode key={i} node={childNode} currentNodeId={currentNodeId} />
            ))
            .join(", ")}
          ) {"=>"} {body}
        </span>
      );

    case "FunctionCall":
      return (
        <div style={style}>
          {node.name.name}(
          {node.arguments.map((childNode, i) => (
            <AstNode key={i} node={childNode} currentNodeId={currentNodeId} />
          ))}
          )
        </div>
      );
    default:
      return <div style={style}>Unknown node kind: {JSON.stringify(node)}</div>;
  }
};

type EventInfoProps = {
  event: EvaluationEvents[number] | undefined;
};

const EventInfo = ({ event }: EventInfoProps) => {
  if (!event) return null;

  return (
    <div>
      <h3>Node Kind: {event.kind}</h3>
      <h3>Scope:</h3>
      <ScopeComponent scope={event.scope} />
    </div>
  );
};

type BindingValueProps = {
  value: Value;
};

const BindingValue = ({ value }: BindingValueProps) => {
  const [expanded, setExpanded] = useState(false);
  if (typeof value === "object" && value !== null && "kind" in value) {
    return (
      <span>
        {expanded ? JSON.stringify(value, null, 2) : value.kind}
        <button onClick={() => setExpanded(!expanded)}>
          {expanded ? "See less" : "See more"}
        </button>
      </span>
    );
  }

  return <span>{value}</span>;
};

type ScopeProps = {
  scope: EvaluationEvents[number]["scope"];
};

const ScopeComponent = ({ scope }: ScopeProps) => {
  return (
    <div>
      {unsafeEntries(scope.bindings).map(([binding, value]) => (
        <div key={binding}>
          <strong>{binding}:</strong> <BindingValue value={value} />
        </div>
      ))}
      {scope.parent && (
        <div>
          <h4>Parent Scope:</h4>
          <ScopeComponent scope={scope.parent} />
        </div>
      )}
    </div>
  );
};
