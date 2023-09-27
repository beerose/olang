import {
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
} from "typescript-parsec"
import { TokenKind, lexer } from "./lexer"
import type * as ast from "./ast"

export const Expression = rule<TokenKind, ast.Expression>()

const NumericLiteral = rule<TokenKind, ast.NumericLiteral>()
const Identifier = rule<TokenKind, ast.Identifier>()
const Term = rule<TokenKind, ast.Expression>()

const UnaryExpression = rule<TokenKind, ast.UnaryExpression>()
const MultiplicativeExpression = rule<TokenKind, ast.Expression>()
const PowerExpression = rule<TokenKind, ast.Expression>()
const AdditiveExpression = rule<TokenKind, ast.Expression>()
const AssignmentExpression = rule<TokenKind, ast.Expression>()
const VariableDeclaration = rule<TokenKind, ast.VariableDeclaration>()
const FunctionExpression = rule<TokenKind, ast.FunctionExpression>()
const FunctionCall = rule<TokenKind, ast.FunctionCall>()
const PrintExpression = rule<TokenKind, ast.PrintExpression>()
const ArrayExpression = rule<TokenKind, ast.ArrayExpression>()

export const Program = rule<TokenKind, ast.Program>()

NumericLiteral.setPattern(
  apply(tok(TokenKind.Number), (value, tokenRange): ast.NumericLiteral => {
    return {
      kind: "NumericLiteral",
      value: parseFloat(value.text),
      meta: {
        from: tokenRange[0]?.pos.index || 0,
        to: tokenRange[0]?.pos.index! + tokenRange[0]?.text.length!,
      },
    }
  }),
)

Identifier.setPattern(
  apply(tok(TokenKind.Identifier), (token, tokenRange): ast.Identifier => {
    return {
      kind: "Identifier",
      name: token.text,
      meta: {
        from: tokenRange[0]?.pos.index || 0,
        to: (tokenRange[0]?.pos.index || 0) + token.text.length,
      },
    }
  }),
)

UnaryExpression.setPattern(
  apply(
    seq(tok(TokenKind.Minus), Term),
    ([operator, operand], tokenRange): ast.UnaryExpression => {
      return {
        kind: "UnaryExpression",
        operator: operator.kind,
        operand: operand,
        meta: {
          from: tokenRange[0]?.pos.index || 0,
          to: operand.meta.to,
        },
      }
    },
  ),
)

Term.setPattern(
  alt_sc(
    FunctionCall,
    NumericLiteral,
    Identifier,
    UnaryExpression,
    kmid(str("("), Expression, str(")")),
  ),
)

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
        meta: {
          from: left.meta.from,
          to: right.meta.to,
        },
      }),
    ),
  ),
)

MultiplicativeExpression.setPattern(
  lrec_sc(
    PowerExpression,
    seq(
      alt(
        tok(TokenKind.Asterisk),
        tok(TokenKind.RightSlash),
        tok(TokenKind.Percent),
      ),
      PowerExpression,
    ),
    (left, [operator, right]): ast.BinaryExpression => ({
      kind: "BinaryExpression",
      operator: operator.kind,
      left,
      right,
      meta: {
        from: left.meta.from,
        to: right.meta.to,
      },
    }),
  ),
)

AdditiveExpression.setPattern(
  lrec_sc(
    MultiplicativeExpression,
    seq(
      alt(tok(TokenKind.Plus), tok(TokenKind.Minus)),
      MultiplicativeExpression,
    ),
    (left, [operator, right]): ast.BinaryExpression => ({
      kind: "BinaryExpression",
      operator: operator.kind,
      left,
      right,
      meta: {
        from: left.meta.from,
        to: right.meta.to,
      },
    }),
  ),
)

AssignmentExpression.setPattern(
  lrec_sc(
    AdditiveExpression,
    seq(tok(TokenKind.Equals), AdditiveExpression),
    (left, [operator, right]): ast.BinaryExpression => ({
      kind: "BinaryExpression",
      operator: operator.kind,
      left,
      right,
      meta: {
        from: left.meta.from,
        to: right.meta.to,
      },
    }),
  ),
)

VariableDeclaration.setPattern(
  apply(
    seq(
      tok(TokenKind.LetKeyword),
      Identifier,
      tok(TokenKind.Equals),
      Expression,
    ),
    ([, identifier, , initializer], tokenRange): ast.VariableDeclaration => {
      return {
        kind: "VariableDeclaration",
        name: identifier,
        initializer,
        meta: {
          from: tokenRange[0]?.pos.index || 0,
          to: initializer.meta.to,
        },
      }
    },
  ),
)

FunctionExpression.setPattern(
  apply(
    seq(
      tok(TokenKind.LeftParen),
      opt_sc(
        kleft(
          list_sc(opt_sc(Identifier), tok(TokenKind.Comma)),
          opt_sc(tok(TokenKind.Comma)),
        ),
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
              opt_sc(tok(TokenKind.Newline)),
            ),
          ),
          tok(TokenKind.RightBrace),
        ),
      ),
    ),
    ([, parameters, , , body], tokenRange): ast.FunctionExpression => ({
      kind: "FunctionExpression",
      parameters: parameters?.filter((p): p is ast.Identifier => !!p) || [],
      body: Array.isArray(body) ? body[1] || [] : [body],
      meta: {
        from: tokenRange[0]?.pos.index || 0,
        to: Array.isArray(body) ? body[2]?.pos.index + 1 : body.meta.to,
      },
    }),
  ),
)

FunctionCall.setPattern(
  apply(
    seq(
      Identifier,
      tok(TokenKind.LeftParen),
      opt_sc(
        kleft(
          list_sc(opt_sc(Expression), tok(TokenKind.Comma)),
          opt_sc(tok(TokenKind.Comma)),
        ),
      ),
      tok(TokenKind.RightParen),
    ),
    (
      [identifier, _leftParen, parameters, _rightParen],
      tokenRange,
    ): ast.FunctionCall => {
      return {
        kind: "FunctionCall",
        name: identifier,
        arguments: (parameters || []).filter((e): e is ast.Expression => !!e),
        meta: {
          from: tokenRange[0]?.pos.index || 0,
          to: _rightParen.pos.index + 1,
        },
      }
    },
  ),
)

PrintExpression.setPattern(
  apply(
    seq(Term, tok(TokenKind.QuestionMark)),
    ([expression], tokenRange): ast.PrintExpression => {
      return {
        kind: "PrintExpression",
        expression,
        meta: {
          from: tokenRange[0]?.pos.index || 0,
          to: expression.meta.to + 1,
        },
      }
    },
  ),
)

ArrayExpression.setPattern(
  apply(
    seq(
      tok(TokenKind.LeftSquareBracket),
      list_sc(opt_sc(Expression), tok(TokenKind.Comma)),
      tok(TokenKind.RightSquareBracket),
    ),
    ([, elements], tokenRange): ast.ArrayExpression => {
      return {
        kind: "ArrayExpression",
        elements: elements.filter((e): e is ast.Expression => !!e),
        meta: {
          from: tokenRange[0]?.pos.index || 0,
          to: (elements?.[elements.length - 1]?.meta.to || 0) + 1,
        },
      }
    },
  ),
)

Expression.setPattern(
  alt_sc(
    PrintExpression,
    ArrayExpression,
    FunctionExpression,
    VariableDeclaration,
    AssignmentExpression,
  ),
)

Program.setPattern(
  apply(
    seq(
      opt_sc(
        kleft(
          list_sc(opt_sc(Expression), opt_sc(tok(TokenKind.Newline))),
          opt_sc(tok(TokenKind.Newline)),
        ),
      ),
      opt_sc(tok(TokenKind.Newline)),
    ),
    ([statements = []], tokenRange): ast.Program => {
      return {
        kind: "Program",
        statements: statements.filter((e): e is ast.Expression => !!e),
        meta: {
          from: tokenRange[0]?.pos.index || 0,
          to: statements[statements.length - 1]?.meta.to || 0,
        },
      }
    },
  ),
)

export function parse(expr: string) {
  const parsed = Program.parse(lexer.parse(expr))
  if (parsed.successful) {
    return parsed.candidates[0]?.result!
  } else {
    return parsed.error
  }
}
