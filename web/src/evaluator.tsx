/* eslint-disable no-case-declarations */
import { useState } from "react";
import * as ast from "../../src/ast";
import { ParseError, TokenError } from "typescript-parsec";
import { type EvaluationEvents, Value } from "../../src/interpreter";
import { unsafeEntries } from "./lib/unsafeEntries";
import { expressionColors } from "./colors";
import { Error } from "./error";

export function Evaluator({
  ast: ast,
  result,
  errors,
  evaluationEvents: events,
  setHighlightRange,
}: {
  ast: ast.Program | undefined;
  result: Value;
  errors: {
    tokenError?: TokenError | undefined;
    parseError?: ParseError | undefined;
    interpreterError?: Error | undefined;
  };
  evaluationEvents: EvaluationEvents;
  setHighlightRange: (range: { from: number; to: number }) => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const onNext = () => {
    const nextIndex =
      currentIndex + 1 >= events.length ? currentIndex : currentIndex + 1;
    setCurrentIndex(nextIndex);
    const currentEvent = events[nextIndex];
    if (
      currentEvent &&
      typeof currentEvent.pos.from !== "undefined" &&
      typeof currentEvent.pos.to !== "undefined"
    ) {
      setHighlightRange({
        from: currentEvent.pos.from,
        to: currentEvent.pos.to,
      });
    }
  };

  const onPrev = () => {
    const prevIndex = currentIndex - 1 < 0 ? currentIndex : currentIndex - 1;
    setCurrentIndex(prevIndex);
    const currentEvent = events[prevIndex];
    if (
      currentEvent &&
      typeof currentEvent.pos.from !== "undefined" &&
      typeof currentEvent.pos.to !== "undefined"
    ) {
      setHighlightRange({
        from: currentEvent.pos.from,
        to: currentEvent.pos.to,
      });
    }
  };

  if (errors.tokenError || errors.parseError || errors.interpreterError) {
    return (
      <Error
        tokenError={errors.tokenError}
        parseError={errors.parseError}
        interpreterError={errors.interpreterError}
      />
    );
  }

  if (!ast) {
    return null;
  }

  return (
    <div>
      <div className="border-b py-4 px-3">
        <span className="font-extrabold py-4">Result: </span>
        <output>{JSON.stringify(result)}</output>
      </div>

      <div className="px-3 py-4">
        <h2 className="font-extrabold">Evaluation steps</h2>
        <span className="isolate inline-flex rounded-md shadow-sm mt-3">
          <button
            type="button"
            className="relative inline-flex items-center rounded-l-md bg-white px-2 text-gray-900 ring-1 ring-inset ring-gray-500 hover:bg-gray-100 focus:z-10"
            onClick={onPrev}
            disabled={currentIndex === 0}
          >
            <span className="sr-only">Previous</span>
            {"<"}
          </button>
          <button
            type="button"
            className="relative -ml-px inline-flex items-center rounded-r-md bg-white px-2 text-gray-900 ring-1 ring-inset ring-gray-500 hover:bg-gray-100 focus:z-10"
            onClick={onNext}
          >
            <span className="sr-only">Next</span>
            {">"}
          </button>
        </span>

        <EventInfo event={events[currentIndex]} />
      </div>
    </div>
  );
}

type EventInfoProps = {
  event: EvaluationEvents[number] | undefined;
};

const EventInfo = ({ event }: EventInfoProps) => {
  if (!event) return null;

  return (
    <div className="py-3">
      <span
        className="px-2 py-1 rounded-md text-sm"
        style={{
          backgroundColor: expressionColors[event.kind],
          color: "white",
        }}
      >
        {event.kind}
      </span>
      <div className="py-3 font-semibold">Current scope:</div>
      <Scope scope={event.scope} />
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
      <span className="relative">
        {expanded ? (
          <pre className="text-xs">{JSON.stringify(value, null, 2)}</pre>
        ) : (
          <span
            className="px-2 py-1 rounded-md text-sm"
            style={{
              backgroundColor: expressionColors[value.kind],
              color: "white",
            }}
          >
            {value.kind}
          </span>
        )}
        <button
          className={`text-xs ml-3 ${expanded ? "absolute right-2 top-0" : ""}`}
          onClick={() => setExpanded(!expanded)}
        >
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

const getAllBindings = (
  scope: EvaluationEvents[number]["scope"]
): Record<string, Value> => {
  if (!scope.parent) return scope.bindings;
  return { ...scope.bindings, ...getAllBindings(scope.parent) };
};

const Scope = ({ scope }: ScopeProps) => {
  const allBindings = getAllBindings(scope);
  return (
    <table className="border border-black">
      <tbody>
        {unsafeEntries(allBindings).map(([name, value]) => (
          <tr key={name}>
            <td className="border border-black p-2 font-semibold">{name}</td>
            <td className="border border-black p-2">
              <BindingValue value={value} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
