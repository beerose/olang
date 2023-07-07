/* eslint-disable no-case-declarations */
import { useEffect, useState } from "react";
import * as ast from "../../src/ast";
import { ParseError } from "typescript-parsec";
import {
  astDebugger,
  interpret,
  type EvaluationEvents,
} from "../../src/interpreter";

export function Evaluator({
  parserOutput,
}: {
  parserOutput: ast.Program | undefined;
}) {
  const [events, setEvents] = useState<EvaluationEvents>([]);
  const [ast, setAst] = useState<ast.Program | null>(null);
  const [error, setError] = useState<ParseError | null>(null);
  const [result, setResult] = useState<unknown | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const onNext = () => {
    setCurrentIndex((index) => (index + 1 < events.length ? index + 1 : index));
  };

  const onPrev = () => {
    setCurrentIndex((index) => (index - 1 >= 0 ? index - 1 : index));
  };

  useEffect(() => {
    if (!parserOutput) return;
    setError(null);
    try {
      const currentAst = assignIds(parserOutput, 0);
      setAst(currentAst as any);

      const evaluationEvents: EvaluationEvents = [];
      const debug = astDebugger(evaluationEvents);

      const res = interpret(currentAst as any, debug);
      setResult(res);
      setEvents(evaluationEvents.sort((a, b) => a.nid - b.nid));
      setError(null);
    } catch (e) {
      if (typeof e === "object" && e !== null && "pos" in e) {
        setError(e as unknown as ParseError);
      }
      console.error(e);
    }
  }, [parserOutput]);

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
      <h1>Scope viewer</h1>
      <h2>Code</h2>
      <AstNode node={ast} currentNodeId={events[currentIndex]?.nid} />

      <h2>Evaluation steps</h2>
      <div>
        <button onClick={onPrev} disabled={currentIndex === 0}>
          Prev
        </button>
        <button onClick={onNext} disabled={currentIndex === events.length - 1}>
          Next
        </button>
        <EventInfo event={events[currentIndex]} />
      </div>
    </div>
  );
}

const assignIds = (
  node: ast.Node | (ast.Node & { id: number }),
  id: number
): any => {
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

const AstNode: React.FC<{ node: ast.Node; currentNodeId: number }> = ({
  node,
  currentNodeId,
}) => {
  const isCurrent = (node as any).id === currentNodeId;
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
          ({<AstNode node={node.left} currentNodeId={currentNodeId} />}
          {node.operator}
          {<AstNode node={node.right} currentNodeId={currentNodeId} />})
        </span>
      );
    case "UnaryExpression":
      return (
        <span style={style}>
          (-{<AstNode node={node.operand} currentNodeId={currentNodeId} />})
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
      return (
        <span style={style}>
          (
          {node.parameters

            .map((childNode, i) => (
              <AstNode key={i} node={childNode} currentNodeId={currentNodeId} />
            ))
            .join(", ")}
          ) {"{"}
          {node.body.map((childNode, i) => (
            <AstNode key={i} node={childNode} currentNodeId={currentNodeId} />
          ))}
          {"}"}
        </span>
      );

    case "FunctionCall":
      return (
        <span style={style}>
          {node.name.name}(
          {node.arguments
            .map((childNode, i) => (
              <AstNode key={i} node={childNode} currentNodeId={currentNodeId} />
            ))
            .join(", ")}
          )
        </span>
      );
    default:
      return <div style={style}>Unknown node kind: {JSON.stringify(node)}</div>;
  }
};

type EventInfoProps = {
  event: EvaluationEvents[number] | undefined;
};

const EventInfo: React.FC<EventInfoProps> = ({ event }) => {
  if (!event) return null;

  return (
    <div>
      <h3>Node Kind: {event.kind}</h3>
      <ScopeComponent scope={event.scope} />
    </div>
  );
};

type BindingValueProps = {
  value: ast.Node;
};

const BindingValue: React.FC<BindingValueProps> = ({ value }) => {
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

const ScopeComponent: React.FC<ScopeProps> = ({ scope }) => {
  return (
    <div>
      <h4>Scope Bindings:</h4>
      {Object.entries(scope.bindings).map(([binding, value]) => (
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
