import {
  Token,
  alt,
  alt_sc,
  apply,
  kleft,
  kmid,
  list_sc,
  lrec_sc,
  opt_sc,
  rule,
  seq,
  str,
  tok,
} from "typescript-parsec";
import { TokenKind, lexer } from "./lexer";
import type * as ast from "./ast";

export const Expression = rule<TokenKind, ast.Expression>();

const NumericLiteral = rule<TokenKind, ast.NumericLiteral>();
const Identifier = rule<TokenKind, ast.Identifier>();
const Term = rule<TokenKind, ast.Expression>();
const LeftHandSideExpression = rule<TokenKind, ast.Expression>();

const UnaryExpression = rule<TokenKind, ast.UnaryExpression>();
const MultiplicativeExpression = rule<TokenKind, ast.Expression>();
const PowerExpression = rule<TokenKind, ast.Expression>();
const AdditiveExpression = rule<TokenKind, ast.Expression>();
const AssignmentExpression = rule<TokenKind, ast.Expression>();
const VariableDeclaration = rule<TokenKind, ast.VariableDeclaration>();
const FunctionExpression = rule<TokenKind, ast.FunctionExpression>();
const FunctionCall = rule<TokenKind, ast.FunctionCall>();
const FunctionCallArguments = rule<TokenKind, ast.Expression[]>();

export const Program = rule<TokenKind, ast.Program>();

NumericLiteral.setPattern(
  apply(
    tok(TokenKind.Number),
    (value: Token<TokenKind.Number>): ast.NumericLiteral => {
      return {
        kind: "NumericLiteral",
        value: parseFloat(value.text),
      };
    }
  )
);

Identifier.setPattern(
  apply(
    tok(TokenKind.Identifier),
    (token): ast.Identifier => ({
      kind: "Identifier",
      name: token.text,
    })
  )
);

UnaryExpression.setPattern(
  apply(
    seq(tok(TokenKind.Minus), Term),
    ([operator, operand]): ast.UnaryExpression => ({
      kind: "UnaryExpression",
      operator: operator.kind,
      operand: operand,
    })
  )
);

// TODO: Object access
LeftHandSideExpression.setPattern(Term);

Term.setPattern(
  alt(
    NumericLiteral,
    Identifier,
    UnaryExpression,
    kmid(str("("), Expression, str(")"))
  )
);

PowerExpression.setPattern(
  alt(
    Term,
    apply(
      seq(Term, tok(TokenKind.AsteriskAsterisk), PowerExpression),
      ([left, , right]) => ({
        kind: "BinaryExpression",
        operator: TokenKind.AsteriskAsterisk,
        left,
        right,
      })
    )
  )
);

MultiplicativeExpression.setPattern(
  lrec_sc(
    PowerExpression,
    seq(
      alt(
        tok(TokenKind.Asterisk),
        tok(TokenKind.RightSlash),
        tok(TokenKind.Percent)
      ),
      PowerExpression
    ),
    (left, [operator, right]): ast.BinaryExpression => ({
      kind: "BinaryExpression",
      operator: operator.kind,
      left,
      right,
    })
  )
);

AdditiveExpression.setPattern(
  lrec_sc(
    MultiplicativeExpression,
    seq(
      alt(tok(TokenKind.Plus), tok(TokenKind.Minus)),
      MultiplicativeExpression
    ),
    (left, [operator, right]): ast.BinaryExpression => ({
      kind: "BinaryExpression",
      operator: operator.kind,
      left,
      right,
    })
  )
);

AssignmentExpression.setPattern(
  lrec_sc(
    AdditiveExpression,
    seq(tok(TokenKind.Equals), AdditiveExpression),
    (left, [operator, right]): ast.BinaryExpression => ({
      kind: "BinaryExpression",
      operator: operator.kind,
      left,
      right,
    })
  )
);

VariableDeclaration.setPattern(
  apply(
    seq(
      tok(TokenKind.LetKeyword),
      Identifier,
      tok(TokenKind.Equals),
      Expression
    ),
    ([, identifier, , initializer]): ast.VariableDeclaration => ({
      kind: "VariableDeclaration",
      name: identifier,
      initializer,
    })
  )
);

FunctionExpression.setPattern(
  apply(
    seq(
      tok(TokenKind.LeftParen),
      opt_sc(
        kleft(
          list_sc(opt_sc(Identifier), tok(TokenKind.Comma)),
          opt_sc(tok(TokenKind.Comma))
        )
      ),
      tok(TokenKind.RightParen),
      tok(TokenKind.Arrow),
      alt(
        Expression,
        seq(
          tok(TokenKind.LeftBrace),
          opt_sc(
            kleft(
              list_sc(Expression, opt_sc(tok(TokenKind.Newline))),
              opt_sc(tok(TokenKind.Newline))
            )
          ),
          tok(TokenKind.RightBrace)
        )
      )
    ),
    ([, parameters, , , body]): ast.FunctionExpression => ({
      kind: "FunctionExpression",
      parameters: parameters?.filter((p): p is ast.Identifier => !!p) || [],
      body: Array.isArray(body) ? body[1] || [] : [body],
    })
  )
);

FunctionCallArguments.setPattern(
  apply(
    seq(
      tok(TokenKind.LeftParen),
      opt_sc(
        kleft(
          list_sc(opt_sc(Expression), tok(TokenKind.Comma)),
          opt_sc(tok(TokenKind.Comma))
        )
      ),
      tok(TokenKind.RightParen)
    ),
    ([, parameters = []]): ast.Expression[] => {
      return parameters.filter((e): e is ast.Expression => !!e);
    }
  )
);

FunctionCall.setPattern(
  apply(
    seq(Identifier, FunctionCallArguments),
    ([identifier, parameters]): ast.FunctionCall => ({
      kind: "FunctionCall",
      name: identifier,
      arguments: parameters,
    })
  )
);

Expression.setPattern(
  alt_sc(
    FunctionExpression,
    FunctionCall,
    VariableDeclaration,
    AssignmentExpression
  )
);

Program.setPattern(
  apply(
    seq(
      opt_sc(
        kleft(
          list_sc(opt_sc(Expression), opt_sc(tok(TokenKind.Newline))),
          opt_sc(tok(TokenKind.Newline))
        )
      ),
      opt_sc(tok(TokenKind.Newline))
    ),
    ([statements = []]): ast.Program => ({
      kind: "Program",
      statements: statements.filter((e): e is ast.Expression => !!e),
    })
  )
);

export function parse(expr: string) {
  const parsed = Program.parse(lexer.parse(expr));
  if (parsed.successful) {
    return parsed.candidates[0]?.result!;
  } else {
    return parsed.error;
  }
}
