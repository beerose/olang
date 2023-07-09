import { ParseError, TokenError } from "typescript-parsec";

export function Error(props: {
  tokenError?: TokenError | undefined;
  parseError?: ParseError | undefined;
  interpreterError?: Error | undefined;
}) {
  if (props.tokenError) {
    return (
      <div className="text-left text-red-500 flex flex-col items-start p-3">
        <div className="font-semibold">Lexer error:</div>
        {props.tokenError.errorMessage}
        <span>
          Row: {props.tokenError.pos?.rowBegin}:{props.tokenError.pos?.rowEnd}{" "}
          Col: {props.tokenError.pos?.columnBegin}:
          {props.tokenError.pos?.columnEnd}
        </span>
      </div>
    );
  }

  if (props.parseError) {
    return (
      <div className="text-left text-red-500 flex flex-col items-start p-3">
        <div className="font-semibold">Parser error:</div>
        {props.parseError.message}
        <span>
          Row: {props.parseError.pos?.rowBegin}:{props.parseError.pos?.rowEnd}{" "}
          Col: {props.parseError.pos?.columnBegin}:
          {props.parseError.pos?.columnEnd}
        </span>
      </div>
    );
  }

  if (props.interpreterError) {
    return (
      <div>
        <pre>{props.interpreterError.message}</pre>
      </div>
    );
  }

  return null;
}
